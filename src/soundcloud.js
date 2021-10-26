import SoundCloud from 'soundcloud-scraper'
import fs from 'fs'
import NodeID3 from 'node-id3'
import ytdl from 'ytdl-core'
import request from 'request'
import ffmpeg from 'ffmpeg-static-electron'
import * as FfmpegCommand from 'fluent-ffmpeg'
import store from './store'

import { v4 as uuidv4 } from 'uuid';
import electron  from 'electron';
import path  from 'path';
FfmpegCommand.setFfmpegPath(ffmpeg.path.replace(
  'app.asar',
  'app.asar.unpacked'
))
var userDataPath, keypath;
var client, key

async function initSC(app) {
  userDataPath = app.getPath('userData');
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
keypath = path.join(userDataPath, "key.txt");
  if (fs.existsSync(keypath)) {
    key = fs.readFileSync(keypath)
  } else {
    key = await SoundCloud.keygen()
    fs.writeFileSync(keypath, key)
  }
  client = new SoundCloud.Client(key)
}

async function download(uri, filename) {
  return new Promise((resolve, reject) => {
    request.head(uri, function (err, res, body) {
      if (err) reject(err)
      request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve).on('error', reject)
    })
  })
};

function streamToString(stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}
async function scDownload(song) {
  client.getSongInfo(song.url.split('?')[0])
    .then(async currSong => {
      const stream = await currSong.downloadProgressive()
      var buf = await streamToString(stream)
      var imgURI = song.thumbnail
      const tags = {
        title: song.title,
        artist: song.artist,
        imgURI: imgURI
      }
      var filepath = store.state.exportFolder + "/" + song.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3'
      console.log(filepath)
      writeFile(tags, buf, filepath).then(() => {
        song.downloadProgress = 1;
        song.downloadURI = filepath;
        store.commit("updateProgress", song)
        store.commit("finishedLoading", song)
      }).catch(err => {
        console.log(err)
      })

    })
    .catch(console.error)
}

async function ytDownload(song) {
  var title = song.title
  var thumbnail = song.url
  var stream = await ytdl(song.url, {
    quality: "highestaudio"
  })
  //var tempFileName = './downloads/' + uuidv4() + '.mp3';
  var tempFileName = path.join(userDataPath, uuidv4() + '.mp3');
  try {
    if (!fs.existsSync("./downloads")) {
      fs.mkdirSync("./downloads")
    }
  } catch (e) {
    console.log("An error occurred.")
  }
  try {
    await FfmpegCommand(stream)
      .output(tempFileName)
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .format('mp3')
      .on('error', (err) => console.error(err))
      .on('end', async () => {
        var buf = fs.readFileSync(tempFileName)
        var imgURI = thumbnail
        const tags = {
          title: song.title,
          artist: song.artist,
          imgURI: song.imgURI
        }
        var filepath = store.state.exportFolder + "/" + title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3'
        writeFile(tags, buf, filepath).then(() => {
          song.downloadProgress = 1;
          song.downloadURI = filepath;
          store.commit("updateProgress", song)
          store.commit("finishedLoading", song)
          fs.unlinkSync(tempFileName)
        }).catch(err => {
          console.log(err)
        })
      })
      .on('progress', function (progress) {
        var splitTime = progress.timemark.split(":")
        var prog = (parseFloat(splitTime[1]) * 60 + parseFloat(splitTime[2])) / song.songLength
        song.downloadProgress = prog;
        store.commit("updateProgress", song)
      }).run()
  } catch (err) {
    console.log(err)
  }
}

function downloadSong(song) {
  if (song.url.includes('soundcloud')) {
    scDownload(song)
  } else if (song.url.includes('youtube')) {
    ytDownload(song)
  }
}

async function writeFile(tags, songBuffer, filename) {
  return new Promise((resolve, reject) => {
    NodeID3.write(tags, songBuffer, function (err, buffer) {
      if (err) reject(err);
      writeBuffer(filename, buffer).then(() => {
        resolve()
      }).catch((err) => {
        reject(err)
      })
    })
  })
}

async function writeBuffer(path, buffer) {
  return new Promise((resolve, reject) => {
    fs.open(path, 'w', function (err, fd) {
      if (err) {
        reject(err)
      }
      fs.write(fd, buffer, 0, buffer.length, null, function (err) {
        if (err) reject(err)
        fs.close(fd, function () {
          resolve()
        })
      })
    })
  });
}

async function checkURL(url) {
  return new Promise(function (resolve, reject) {
    var info = false
    if (url.includes('soundcloud')) {
      client.getSongInfo(url.split('?')[0])
        .then(song => {
          var imgURI = song.thumbnail
          console.log(song)
          const tags = {
            title: song.title,
            artist: song.author.name,
            imgURI: imgURI,
            url: url,
            originalInfo: {
              description: song.description.normalize(),
              title: song.title.normalize(),
              uploader: song.author.name.normalize()
            }
          }
          if (song.title.split(' - ').length > 1) {
            tags.title = song.title.split(' - ')[1].normalize()
            tags.artist = song.title.split(' - ')[0].normalize()
          }
          resolve(tags)
        })
        .catch(reject)
    } else if (url.includes('youtube')) {
      ytdl.getInfo(url).then(song => {
        var title = song.videoDetails.title

        console.log(song.videoDetails)


        var thumbnail = song.videoDetails.thumbnails[0].url
        const tags = {
          title: title,
          artist: '',
          imgURI: thumbnail,
          url: url,
          songLength: song.videoDetails.lengthSeconds,
          originalInfo: {
            description: song.videoDetails.description,
            title: title,
            uploader: song.videoDetails.author.name
          }
        }
        if (title.split(' - ').length > 1) {
          tags.title = title.split(' - ')[1]
          tags.artist = title.split(' - ')[0]
        }
        resolve(tags)
      })
        .catch(reject)
    } else {
      reject('url no good')
    }
  })
}


async function updateTags(song) {
  console.log("attempting to update song")
  var tags = {
    title: song.title,
    artist: song.artist,
    imgURI: song.imgURI
  }
  var filepath = store.state.exportFolder + "/" + song.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3'
  console.log(tags, song)

  NodeID3.update(tags, song.downloadURI, function (err, buffer) {
    if (err) console.log(err)
  })
}
export { downloadSong, checkURL, updateTags, initSC }

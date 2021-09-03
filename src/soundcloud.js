import SoundCloud from 'soundcloud-scraper'
import fs from "fs"
import NodeID3 from 'node-id3'

import ytdl from 'ytdl-core'

import request from 'request'
import ffmpeg from 'ffmpeg-static-electron'
import * as FfmpegCommand from 'fluent-ffmpeg';
FfmpegCommand.setFfmpegPath(ffmpeg.path)

var keypath = './key.txt'

var client, key

async function init() {
  if (fs.existsSync(keypath)) {
    key = fs.readFileSync(keypath)
  } else {
    key = await SoundCloud.keygen()
    fs.writeFileSync(keypath, key)
  }
  client = new SoundCloud.Client(key)
}
init()

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

function scDownload(url) {
  client.getSongInfo(url.split("?")[0])
    .then(async song => {
      const stream = await song.downloadProgressive()
      var buf = await streamToString(stream)
      var imgURI = song.thumbnail
      const tags = {
        title: song.title,
        artist: song.author.name,
        imgURI: imgURI
      }
      if (song.title.split(' - ').length > 1) {
        tags.title = song.title.split(' - ')[1]
        tags.artist = song.title.split(' - ')[0]
      }
      var filepath = './downloads/' + song.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3'
      writeFile(tags, buf, filepath)
    })
    .catch(console.error)
}

async function ytDownload(url) {
  var info = await ytdl.getInfo(url)
  var title = info.videoDetails.title;
  var thumbnail = info.videoDetails.thumbnails[0].url
  var stream = await ytdl(url);

  try {
    await FfmpegCommand(stream)
      .output("./temp.mp3")
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .format('mp3')
      .on('error', (err) => console.error(err))
      .on('end', () => {

        var buf = fs.readFileSync("./temp.mp3")
        var imgURI = thumbnail
        const tags = {
          title: title,
          artist: "",
          imgURI: imgURI
        }
        if (title.split(' - ').length > 1) {
          tags.title = title.split(' - ')[1]
          tags.artist = title.split(' - ')[0]
        }
        var filepath = './downloads/' + title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3'
        writeFile(tags, buf, filepath)
      })
      .on('progress', function (progress) {
        console.log(progress)
      }).run()
  }
  catch (err) {
    console.log(err)
  }

}

function downloadSong(url) {
  if (url.includes("soundcloud")) {
    scDownload(url)
  }
  else if (url.includes("youtube")) {
    ytDownload(url)
  }
}

function writeFile(tags, songBuffer, filename) {
  NodeID3.write(tags, songBuffer, function (err, buffer) {
    writeBuffer(filename, buffer)
    if (err) console.error(err)
  })
}

function writeBuffer(path, buffer) {
  fs.open(path, 'w', function (err, fd) {
    if (err) {
      throw new Error('could not open file: ' + err)

    }
    fs.write(fd, buffer, 0, buffer.length, null, function (err) {
      if (err) new Error('error writinf file: ' + err)
      fs.close(fd, function () {
        console.log('wrote the file successfully')
      })
    })
  })
}


export default downloadSong

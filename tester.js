const ytdl = require("ytdl-core")

const fs = require("fs")
var ffmpeg = require('ffmpeg-static-electron');
var FfmpegCommand = require('fluent-ffmpeg');
var NodeID3 = require("node-id3")
FfmpegCommand.setFfmpegPath(ffmpeg.path)


console.log(ffmpeg.path)


var urls = [
    "https://www.youtube.com/watch?v=FwPysVi4hJ0"
]

urls.forEach(el => {
    if (el.includes("soundcloud")) {
        console.log("sc")
    }
    else if (el.includes("youtube")) {
        console.log("yt")
        dlYT(el)
    }
    else {
        console.log("nthn");
    }
})


function streamToString(stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
        stream.on('error', (err) => reject(err))
        stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
}


async function dlYT(url) {
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

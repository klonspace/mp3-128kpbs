const SoundCloud = require("soundcloud-scraper");
const fs = require("fs");
const NodeID3 = require('node-id3')

const request = require('request');


var keypath = './key.txt'

var client, key;

async function init() {
    if (fs.existsSync(keypath)) {
        key = fs.readFileSync(keypath)
    }
    else {
        key = await SoundCloud.keygen()  
        fs.writeFileSync(keypath, key);
    }
    client = new SoundCloud.Client(key)
    // downloadSong( "https://soundcloud.com/plurgatti-boy-420/heres-that-new-plurgatti-material-you-wanted-i-hope-youre-happy")
}
init();




async function download(uri, filename) {
    return new Promise((resolve, reject) => {
        request.head(uri, function (err, res, body) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve).on("error", reject);
        });
    })

};


function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    })
}
function downloadSong(url) {

    client.getSongInfo(url)
        .then(async song => {
            console.log(song)
            const stream = await song.downloadProgressive();
            var buf = await streamToString(stream)
            var imgURI = song.thumbnail;
            var localIMG = "./" + imgURI.split("/")[imgURI.split("/").length - 1];
            await download(imgURI, localIMG)
            const tags = {
                title: song.title,
                artist: song.author.name,
                APIC: localIMG
            }

            if (song.title.split(" - ").length > 1) {
                tags.title = song.title.split(" - ")[1];
                tags.artist = song.title.split(" - ")[0];
            }
            var filepath = "./"+song.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()+".mp3";

            NodeID3.write(tags, buf, function (err, buffer) {
                writeBuffer(filepath, buffer);
                if (err) console.error(err)
            })


        })
        .catch(console.error);

}

function writeBuffer(path, buffer) {
    fs.open(path, 'w', function (err, fd) {
        if (err) {
            throw 'could not open file: ' + err;
        }
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function () {
                console.log('wrote the file successfully');
            });
        });
    });
}

module.exports = {func : downloadSong} 
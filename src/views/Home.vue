<template>
  <div class="home">
    <input type="text" id="url" @input="submitURL" placeholder="DROP/PASTE URL"><br>
    <!-- <input type="button" value="submit" @click="submitURL"> -->
    <div class="songlist">
      <ul>
        <div v-for="song in $store.state.songs" :key="song.url">
          <div :data-id="song.id" class="song">
            <div class="imgContainer">
              <img :src="song.imgURI">
            </div>
            <div class="textBlocks">
              <div class="block">
                <div class="blockTitle">
                  ARTIST
                </div>
                <div v-html="song.artist" contenteditable="true" data-which="artist" @blur="updateStore" class="blockContent" />
              </div>
              <div class="block">
                <div class="blockTitle">
                  TRACK
                </div>
                <div v-html="song.title" contenteditable="true" data-which="title" @blur="updateStore" class="blockContent" />
              </div>
            </div>

          </div>
          <div class="loadingBar">
            <div class="loadedPart" :style="loaded(song.downloadProgress)">

            </div>
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

const { ipcRenderer } = window.require("electron");

import ffmpeg from 'ffmpeg-static-electron'

console.log(ffmpeg.path)
export default {
    name: "Home",
    props: ["songs"],
    components: {},
    mounted() {
        console.log(this.$store.state);
    },
    methods: {
        test() {
            console.log("to");
        },
        submitURL() {
            var url = document.getElementById("url").value;
            ipcRenderer.send("songURL", url);
        },
        updateStore(e) {
            var params = {
                id: e.srcElement.parentNode.parentNode.parentNode.dataset.id,
                param: e.srcElement.dataset.which,
                value: e.srcElement.innerHTML,
            };
            this.$store.dispatch("updateInfo", params);
        },
        loaded(progress) {
            console.log(progress);
            return {
                width: progress * 100 + "%",
            };
        },
    },
};
</script>

<style scoped lang="scss">
input {
    text-align: center;
    font-size: 40px;
    border-radius: 0px;
    border: 1px solid black;
    background-color: #fff;
    color: black;
    width: 100%;
    box-sizing: border-box;
    font-family: "Terminal Grotesque";
    padding-top: 5px;
}
::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: black;
    opacity: 1; /* Firefox */
}
ul {
    list-style: none;
    margin-left: 0px;
    padding-left: 0px;
}
.song {
    display: flex;
    margin-bottom: 10px;
    font-size: 30px;
    text-align: left;

    .imgContainer {
        position: relative;
        width: 100px;
        height: 100px;
        flex-basis: 100px;
        flex-shrink: 0;
        margin-right: 10px;
        flex-grow: 0;
        img {
            position: absolute;
            top: 0px;
            object-fit: cover;
            width: 100%;
            height: 100%;
        }
    }
}
.loadingBar {
    width: 100%;
    height: 3px;
    background-color: white;
    margin-bottom: 1em;
    .loadedPart {
        background-color: grey;
        height: 100%;
    }
}
.textBlocks {
    display: flex;
    flex-grow: 1;
}
.block {
    font-size: 30px;
    margin-right: 10px;
    width: calc(50% - 5px);
    overflow: hidden;
    &:last-of-type {
        margin-right: 0px;
    }
    .blockTitle {
        font-size: 30%;
        margin-bottom: 1em;
        font-weight: bold;
    }
    .blockContent {
        font-family: "Terminal Grotesque";
    }
}
</style>

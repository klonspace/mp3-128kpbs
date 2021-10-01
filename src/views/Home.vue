<template>
  <div class="home">
    <div class="inputContainer">
      <input type="text" id="url" @input="submitURL">
      <div class="overlay" v-html="placeholder" :class="{'error' : errorWithURL}"></div>
    </div>
    <!-- <input type="button" value="submit" @click="submitURL"> -->
    <div class="songlist">
      <ul>
        <div v-for="(song, i) in $store.state.songs" :key="song.url+i">
          <div :data-id="song.id" class="song">
            <div class="imgContainer">
              <img :src="song.imgURI">
            </div>
            <div class="textPartContainer">
              <div class="textBlocks">
                <div class="block">
                  <div class="blockTitle">
                    ARTIST
                  </div>
                  <div v-html="song.artist" contenteditable="true" data-which="artist" @blur="updateStore" @paste="specialPaste" class="blockContent" />
                </div>
                <div class="block">
                  <div class="blockTitle">
                    TRACK
                  </div>
                  <div v-html="song.title" contenteditable="true" data-which="title" @blur="updateStore" @paste="specialPaste" class="blockContent" />
                </div>
              </div>
              <div class="morebutton">
                <div @click="openSong(i)" v-html="openStatus(i)?'- Less Info':'+ More Info'" />
              </div>
              <div class="info" v-if="openStatus(i)">
                <div>
                  Original Title :
                  <div v-html="song.originalInfo.title" />
                </div>
                <div>
                  Uploader Name :
                  <div v-html="song.originalInfo.uploader" />
                </div>
                <div>
                  Description :
                  <div v-html="song.originalInfo.description" />
                </div>
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

import ffmpeg from "ffmpeg-static-electron";

console.log(ffmpeg.path);
export default {
  name: "Home",
  props: ["songs"],
  components: {},
  data() {
    return {
      checkingURL: false,
      checkingURLString: "loading",
      errorWithURL: false,
      selected: -1,
    };
  },
  mounted() {
    console.log(this.$store.state);
    ipcRenderer.on("emptyInput", (evt, message) => {
      document.getElementById("url").value = "";
      this.checkingURL = false;
      document.getElementById("url").disabled = false;
    });
    ipcRenderer.on("errorWithInput", (evt, message) => {
      document.getElementById("url").value = "";
      this.lastErrorTime = new Date().getTime();
      this.checkingURL = false;
      this.errorWithURL = true;
      setTimeout(() => {
        this.errorWithURL = false;
        document.getElementById("url").disabled = false;
      }, 1000);
    });
    this.stringAnim();
  },
  computed: {
    placeholder() {
      if (this.checkingURL) {
        return this.checkingURLString;
      } else if (this.errorWithURL) {
        return "Error with URL";
      } else {
        return "DROP/PASTE<br>URL";
      }
    },
  },
  methods: {
    test() {
      console.log("to");
    },
    submitURL() {
      var url = document.getElementById("url").value;
      document.getElementById("url").value = "";
      document.getElementById("url").disabled = true;
      ipcRenderer.send("songURL", url);
      this.checkingURL = true;
    },
    updateStore(e) {
      var params = {
        id: e.srcElement.parentNode.parentNode.parentNode.parentNode.dataset.id,
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
    stringAnim() {
      this.checkingURLString =
        this.checkingURLString.substring(1) + this.checkingURLString.charAt(0);
      setTimeout(this.stringAnim, 200);
    },
    openSong(song) {
      console.log(song);
      if (song == this.selected) {
        this.selected = -1;
      } else {
        this.selected = song;
      }
    },
    openStatus(song) {
      return song == this.selected;
    },
    specialPaste(e) {
      e.preventDefault();
      var text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },
  },
};
</script>

<style scoped lang="scss">
.inputContainer {
  .overlay {
    position: absolute;
    top: 15px;
    left: 0px;
    width: 100%;
    pointer-events: none;
    font-family: "Thermo";
    font-size: 30px;
    &.error {
      color: red;
    }
  }
  input {
    text-align: center;
    font-size: 40px;
    border-radius: 0px;
    border: 1px solid black;
    background-color: #fff;
    color: black;
    width: 100%;
    box-sizing: border-box;
    font-family: "Thermo";
    padding-top: 5px;
    height: 70px;
  }
}
::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: grey;
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
.textPartContainer {
  overflow: hidden;
  position: relative;
  width: 100%;
  // max-height: 100px;
}
.textBlocks {
  width: 100%;
  display: flex;
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
    font-family: "Thermo";
    border: 1px solid #ddd;
    color: black !important;
  }
}
.morebutton {
  font-family: "Thermo";
  cursor: pointer;
}

.info {
  font-size: 50%;
  font-family: "Thermo";
  color: #f00;
  padding-top: 20px;
  & > div > div {
    margin: 10px 0px;
    font-size: 200%;
  }
}
</style>

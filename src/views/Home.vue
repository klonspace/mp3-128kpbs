<template>
  <div class="home">
    <div class="inputContainer">
      <input type="text" id="url" @input="submitURL">
      <div class="overlay" v-html="placeholder" :class="{'error' : errorWithURL, 'loading': checkingURL}"></div>
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
                  <div v-html="song.artist" spellcheck="false" data-fontsize="1" contenteditable="true" data-which="artist" @blur="updateStore" @paste="specialPaste" @keydown="preventEnter" class="blockContent" />
                </div>
                <div class="block">
                  <div class="blockTitle">
                    TRACK
                  </div>
                  <div v-html="song.title" spellcheck="false" data-fontsize="1" contenteditable="true" data-which="title" @blur="updateStore" @paste="specialPaste" @keydown="preventEnter" class="blockContent" />
                </div>
              </div>
              <div class="morebutton">
                <div @click="openSong(i)" v-html="openStatus(i)?'LESS INFO':'MORE INFO'" />
              </div>

            </div>

          </div>
          <div class="info" v-if="openStatus(i)">
            <div v-html="song.originalInfo.uploader" />
            <div v-html="song.originalInfo.title" />
            <div v-html="song.originalInfo.description" />
          </div>

          <div class="loadingBar">
            <div class="loadedPart" :style="loaded(i)" data-currwidth="0">

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
            mutableSongs : []
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
        this.progressSmooth()
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
        numTracks() {
            return this.$store.state.songs.length;
        },
    },
    watch: {
        numTracks(newN, oldN) {
            
            requestAnimationFrame(() => {
                document
                    .querySelectorAll(".textBlocks")
                    [newN - 1].querySelectorAll(".blockContent")
                    .forEach((el) => {
                        this.checkTextInput(el);
                    });
            })
        },
    },
    methods: {
        progressSmooth() {
            requestAnimationFrame(this.progressSmooth)
            this.$store.state.songs.forEach((song, i) => {
                song.smoothProgress += (song.downloadProgress - song.smoothProgress)/20;
            })
        },

        submitURL() {
            var url = document.getElementById("url").value;
            document.getElementById("url").value = "";
            document.getElementById("url").disabled = true;
            ipcRenderer.send("songURL", url);
            this.checkingURL = true;
        },
        preventEnter(e) {
            this.checkTextInput(e.srcElement);
            if (e.keyCode == 13) e.preventDefault();
            return e.keyCode != 13;
        },
        updateStore(e) {
            var params = {
                id: e.srcElement.parentNode.parentNode.parentNode.parentNode.dataset.id,
                param: e.srcElement.dataset.which,
                value: e.srcElement.innerHTML,
            };
            this.$store.dispatch("updateInfo", params);
        },
        loaded(id) {
            return {
                width: this.$store.state.songs[id].smoothProgress * 100 + "%",
                // width: "100%",
            };
        },
        stringAnim() {
            this.checkingURLString = this.checkingURLString.substring(1) + this.checkingURLString.charAt(0);
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
            var text = e.clipboardData.getData("text/plain").replace(/\n/g, " ");
            document.execCommand("insertText", false, text);
        },
        checkTextInput(input) {
            if (input.dataset.fontsize == 1) {
                if (input.getBoundingClientRect().height > 68) {
                    input.dataset.fontsize = 0;
                    input.classList.add("smallerFont")
                }
            } else {
                if (input.getBoundingClientRect().height < 40) {
                    input.dataset.fontsize = 1;
                    input.classList.remove("smallerFont")
                }
            }
            console.log(input.getBoundingClientRect().height);
        },
    },
};
</script>

<style scoped lang="scss">
.home {
    font-family: "Thermo";
    font-size: 38px;
    line-height: 34px;
}
.inputContainer {
    position: fixed;
    z-index: 100;
    background-color: white;
    width: 100%;
    top: 0px;
    left: 0px;
    padding: 10px;
    box-sizing: border-box;
    .overlay {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0px;
        width: 100%;
        pointer-events: none;

        &.error {
            color: red;
        }
        &.loading {
            color: white;
        }
    }

    input {
        text-align: center;
        border-radius: 0px;
        border: 1px solid black;
        background-color: #fff;
        color: black;
        width: 100%;
        box-sizing: border-box;
        font-family: "Thermo";
        // padding-top: 5px;
        height: 110px;
        font-size: 90px;
    }
    input:focus {
        background-color: black;
        color: white;
        outline: none !important;
    }
    input:focus + .overlay {
        display: none;
    }
    input:disabled {
        background-color: black;
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
    margin: 10px 0px;
    li {
        margin: 0px;
    }
}
.songlist {
    margin-top: 120px;
}
.song {
    display: flex;
    margin-bottom: 10px;
    text-align: left;

    .imgContainer {
        position: relative;
        width: 95px;
        height: 95px;
        flex-basis: 95px;
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
    height: 1px;
    background-color: white;
    margin-bottom: 10px;
    .loadedPart {
        background-color: grey;
        height: 100%;
    }
}
.textPartContainer {
    overflow: hidden;
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
}
.textBlocks {
    width: 100%;
    display: flex;
    flex-grow: 1;
}
.block {
    margin-right: 10px;
    width: calc(50% - 5px);
    overflow: hidden;
    &:last-of-type {
        margin-right: 0px;
    }
    .blockTitle {
        font-size: 10px;
        line-height: 1em;
        position: absolute;
        top: 0px;
        font-family: Arial, Helvetica, sans-serif;
    }
    .blockContent {
        font-family: "Thermo";
        // border: 1px solid #ddd;
        color: black;
        margin-top: 18px;
        display: block;
    }
    .blockContent.smallerFont {
        font-size: 25px;
        line-height: 23px;
    }
    .blockContent:hover {
        background-color: black;
        color: white;
    }
    .blockContent:focus {
        background-color: black;
        color: white;
        outline: none !important;
    }
}
.morebutton {
    font-family: "Arial";
    height: 10px;
    font-size: 10px;
    line-height: 1em;
    cursor: pointer;
}

.info {
    font-size: 10px;
    line-height: 12px;
    font-family: "Arial";
    // color: #f00;
    // padding-top: 20px;
    padding-left: 106px;
    text-align: left;
    margin-bottom: 10px;
    & > div > div {
        margin: 0px 0px;
        // font-size: 200%;
    }
}

@media screen and (max-width: 485px) {
    .blockContent {
        font-size: 25px;
        line-height: 23px;
    }
}
</style>

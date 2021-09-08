<template>
  <div class="home">
    <input type="text" id="url" @input="submitURL" placeholder="URL"><br>
    <!-- <input type="button" value="submit" @click="submitURL"> -->
    <div class="songlist">
      <ul>
        <div v-for="song in $store.state.songs" :key="song.url" class="song">
          <div class="imgContainer">

            <img :src="song.imgURI">
          </div>
          <div class="info" :data-id="song.id">
            Title : <div v-html="song.title" contenteditable="true" data-which="title" @input="updateStore" /> <br>
            Artist : <div v-html="song.artist" contenteditable="true" data-which="artist" @input="updateStore" /> 
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

const { ipcRenderer } = window.require("electron");

export default {
    name: "Home",
    props: ["songs"],
    components: {},
    mounted() {
        console.log(this.$store);
    },
    methods: {
        test() {
          console.log("to")
        },
        submitURL() {
            var url = document.getElementById("url").value;
            ipcRenderer.send("songURL", url);
        },
        updateStore(e) {
          var params = {
            id : e.srcElement.parentNode.dataset.id,
            param : e.srcElement.dataset.which,
            value : e.srcElement.innerHTML
          }
          this.$store.dispatch("updateInfo", params)

          console.log(this.$store.state.songs[0])
        }
    },
};
</script>

<style scoped lang="scss">
input {
  text-align: center;
  font-size: 40px;
  border-radius: 10px;
  border: 1px solid blue;
  background-color: #ddd;
  color: black;
}
::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: blue;
  opacity: 1; /* Firefox */
}

.song {
    display: flex;
    padding: 10px;
    border: 1px solid black;
    margin-bottom: 10px;
    font-size: 30px;
    text-align: left;

    .imgContainer {
        position: relative;
        width: 200px;
        height: 200px;
        margin-right: 10px;
        img {
            position: absolute;
            top: 0px;
            object-fit: cover;
            width: 100%;
            height: 100%;
        }
    }
}
</style>

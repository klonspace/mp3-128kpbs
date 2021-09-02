<template>
  <div class="home">
    <input type="text" id="url"><br>
    <input type="button" value="submit" @click="submitURL">
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

const {ipcRenderer} = window.require("electron")

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  methods : {
    submitURL() {
      var url = document.getElementById("url").value;
      ipcRenderer.send('songURL', url)
    }
  }}
</script>

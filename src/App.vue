<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
// In renderer process to call actions you need to use `dispatch` or `mapActions`
// Don't use `commit` because actions fired via `commit` will not be shared between processes
import store from '@/store/'

const { ipcRenderer } = window.require('electron')
export default {
  mounted () {
    ipcRenderer.on('goToHome', () => {
      this.$router.push('/')
    })
    ipcRenderer.on('goToAbout', () => {
      this.$router.push('/about')
    })
    
  }

}
</script>
<style lang="scss">
html, body {
    background-color: white;
    // font-size: 20px;
    padding: 0px;
    margin: 0px;
    
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    background-color: white;
    padding: 10px;
}

#nav {
    padding: 30px;

    a {
        font-weight: bold;
        color: #2c3e50;

        &.router-link-exact-active {
            color: #42b983;
        }
    }
}
</style>

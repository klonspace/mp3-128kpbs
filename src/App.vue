<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
const { ipcRenderer } = window.require("electron");

// In renderer process to call actions you need to use `dispatch` or `mapActions`
// Don't use `commit` because actions fired via `commit` will not be shared between processes
import store from "@/store/"
export default {
    mounted() {
        ipcRenderer.on("goToHome", () => {
            this.$router.push("/");
        });
        ipcRenderer.on("goToAbout", () => {
            this.$router.push("/about");
        });

        ipcRenderer.on("emptyInput", (evt, message) => {
            document.getElementById("url").value = ""
        });
    },

};
</script>
<style lang="scss">
html, body {
    background-color: white;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    background-color: white;
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

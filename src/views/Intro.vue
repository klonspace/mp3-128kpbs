<template>
  <div
    @click="setFolder"
  >Please click here to setup where the files should be downloaded. This can be changed through the menu later.</div>
</template>
<script>
const { ipcRenderer } = window.require("electron");
export default {
  methods: {
    setFolder() {
      ipcRenderer.send("setFolder");
    },
  },
};
</script>
<style lang="scss" scoped>
div {
  font-family: "XLMonoAlt";
  font-size: 40px;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
</style>
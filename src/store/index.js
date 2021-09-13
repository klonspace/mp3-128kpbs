import Vue from 'vue'
import Vuex from 'vuex'
// import Store from 'electron-store'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

import {updateTags } from "../soundcloud.js"

Vue.use(Vuex)

// const persistentStore = new Store();

export default new Vuex.Store({
  state: {
    songs: [],
    exportFolder : ""
  },
  mutations: {
    setFolder(state, folder) {
      state.exportFolder = folder
    },
    pushURL (state, song) {
      state.songs.push(song)
    },
    updateInfo (state, info) {
      console.log("updating info")
      state.songs.forEach(function (song) {
        if (song.id == info.id) {
          song[info.param] = info.value
          if(song.hasOwnProperty("downloadURI")) {
            updateTags(song)
          } 
        }
      })
    },
    updateProgress(state, info) {
      console.log(info.downloadProgress)
      state.songs.forEach(function (song) {
        if (song.id == info.id) {
          song.downloadProgress = info.downloadProgress
        }
      })
    },
    finishedLoading(state, info) {
      state.songs.forEach(function (song) {
        if (song.id == info.id) {
          song.downloadURI = info.downloadURI
          updateTags(song)
        }
      })
    }
  },
  actions: {
    updateInfo ({ state, commit }, info) {
      console.log("asknkjasf")
      commit('updateInfo', info)
    }
  },
  plugins: [
    // createPersistedState(),
    createSharedMutations()
  ]
})

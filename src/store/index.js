import Vue from 'vue'
import Vuex from 'vuex'
// import Store from 'electron-store'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

Vue.use(Vuex)

// const persistentStore = new Store();

export default new Vuex.Store({
  state: {
    songs: []
  },
  mutations: {
    pushURL (state, song) {
      state.songs.push(song)
    },
    updateInfo (state, info) {
      state.songs.forEach(function (song) {
        if (song.id == info.id) {
          song[info.param] = info.value
        }
      })
    }
  },
  actions: {
    updateInfo ({ state, commit }, info) {
      console.log(state)
      commit('updateInfo', info)
    }
  },
  plugins: [
    // createPersistedState(),
    createSharedMutations()
  ]
})

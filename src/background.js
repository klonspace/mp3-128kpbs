'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

import { createMenu, setOutputFolder } from '@/menu.js'
import { downloadSong, checkURL, initSC } from '@/soundcloud.js'

import store from './store'

const isDevelopment = process.env.NODE_ENV !== 'production'

import Preferences from "./preferences.js"

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

var win
var exportFolder = "";
var preferences = new Preferences({
  configName: "prefs",
  defaults: {
    exportFolder: ""
  }
})

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 450,
    height: 600,
    title: "MP3 128 KBPS",
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })



  createMenu(win, preferences)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) 
    win.webContents.openDevTools()

  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  // win.webContents.openDevTools()
  if (preferences.get("exportFolder")) {
    store.commit("setFolder", preferences.get("exportFolder"));
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  if (process.platform === 'darwin') {
    globalShortcut.register('Command+Q', () => {
      app.quit();
    })
  }

  initSC(app)
  createWindow()
})

app.on('second-instance', (event, argv) => {
  console.log('HERE')
  console.log(argv[argv.length - 1])
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('songURL', (e, data) => {
  // downloadSong(data)
  addSongToList(data)
})

ipcMain.on('setFolder', (e, data) => {
  setOutputFolder(win, preferences);
})

function addSongToList(url) {
  checkURL(url).then(function (songInfo) {
    songInfo.id = new Date().getTime()
    songInfo.downloadProgress = 0;
    songInfo.smoothProgress = 0;
    store.commit('pushURL', songInfo)
    win.webContents.send('emptyInput')
    downloadSong(songInfo)

  }).catch(function (error) {
    console.error(error)
    win.webContents.send('errorWithInput')
  })
}



var songs = []

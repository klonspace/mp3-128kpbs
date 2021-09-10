'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

import createMenu from '@/menu.js'
import { downloadSong, checkURL } from '@/soundcloud.js'

import store from './store'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

var win

async function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })

  createMenu(win)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
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
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

app.on('second-instance', (event, argv) => {
  console.log('HERE')
  console.log(argv[argv.length - 1])
  // Someone tried to run a second instance, we should focus our window.
  // if (argv.length >= 2) {
  //     const urlPath = encodeURI(`file:///${argv[argv.length - 1]}`);
  //     openDeepLink(`app://open-image-url?location=${urlPath}`, mainWindow);
  // }

  // if (mainWindow) {
  //     if (mainWindow.isMinimized()) {
  //         mainWindow.restore();
  //     }
  //     mainWindow.focus();
  // }
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

function addSongToList (url) {
  console.log(url)
  checkURL(url).then(function (songInfo) {
    songInfo.id = new Date().getTime()
    store.commit('pushURL', songInfo)
    win.webContents.send('emptyInput')
  }).catch(function (error) {
    console.error(error)
  })
}

var songs = []

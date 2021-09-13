import { app, Menu, Tray, dialog } from 'electron'
import os from 'os'
const path = require('path')
// import trayicon from "./icon.jpg"


import store from './store'
function setOutputFolder(win) {
  dialog.showOpenDialog(win, {
    properties: ['openFile', 'openDirectory']
  }).then(result => {
    if (!result.canceled) {
      store.commit("setFolder", result.filePaths);
    }
  }).catch(err => {
    console.log(err)
  })
}
function createMenu(window) {


  var menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {
          label: 'Set output folder...',
          click() {
            setOutputFolder(window)
          }

        },
        {
          label: 'Exit',
          click() {
            app.quit()
          }
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
}


export { createMenu, setOutputFolder }

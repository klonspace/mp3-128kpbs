import { app, Menu, Tray, dialog } from 'electron'
import os from 'os'
const path = require('path')
// import trayicon from "./icon.jpg"


import store from './store'
function setOutputFolder(win, prefs) {
  dialog.showOpenDialog(win, {
    properties: ['openFile', 'openDirectory']
  }).then(result => {
    console.log(result.filePaths)
    if (!result.canceled) {
      store.commit("setFolder", result.filePaths);
      prefs.set("exportFolder", result.filePaths);
    }
    else {
      setOutputFolder(win, prefs);
    }
  }).catch(err => {
    console.log(err)
  })
}
function createMenu(window, prefs) {


  var menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {
          label: 'Set output folder...',
          click() {
            setOutputFolder(window, prefs)
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

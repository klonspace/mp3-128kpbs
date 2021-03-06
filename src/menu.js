import { app, Menu, Tray, dialog } from 'electron'
import os from 'os'
const path = require('path')
// import trayicon from "./icon.jpg"


import store from './store'
function setOutputFolder(win, prefs) {
  dialog.showOpenDialog(win, {
    properties: ['openFile', 'openDirectory'],
    title : "Please select where you would like to save downloaded files. This can be changed later."
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
    },
    {
      label: "Edit",
      submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]}
  ])
  Menu.setApplicationMenu(menu)
}


export { createMenu, setOutputFolder }

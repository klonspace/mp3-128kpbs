import { app, Menu, Tray } from 'electron'
import os from 'os'
const path = require('path')
// import trayicon from "./icon.jpg"

function createMenu (window) {
  let tray = null
  const imageFolder = path.join(__dirname)

  let trayImage
  const platform = os.platform()
  // Determine appropriate icon for platforms
  if (platform === 'darwin' || platform === 'linux') {
    trayImage = path.join(imageFolder, '/icon.png')
  } else if (platform === 'win32') {
    trayImage = path.join(imageFolder, '/icon.ico')
  }

  tray = new Tray(trayImage)
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: 'Item1', type: 'radio' },
  //   { label: 'Item2', type: 'radio' },
  //   { label: 'Item3', type: 'radio', checked: true },
  //   { label: 'Item4', type: 'radio' }
  // ])
  tray.setToolTip('This is my application.')
  // tray.setContextMenu(contextMenu)
  tray.on('drop-text', function (t) {
    console.log(t)
  })
  tray.on('drop', function (t) {
    console.log(t)
  })
  tray.on('drop-files', function (t) {
    console.log(t)
  })

  console.log(tray)

  window.tray = tray

  var menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {
          label: 'Home',
          click () {
            console.log('Navigate to Home')
            window.webContents.send('goToHome')
          }

        },
        {
          label: 'About',
          click () {
            console.log('Navigate to About')
            window.webContents.send('goToAbout')
          }
        },
        {
          label: 'Exit',
          click () {
            app.quit()
          }
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
}

export default createMenu

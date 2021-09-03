const { app, BrowserWindow, ipcMain } = require('electron')


var downloadSong = require('./soundcloud.js').func

// try {
//     require('electron-reloader')(module)
//   } catch (_) {}


let mainWindow

require('./menu.js')
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })

  mainWindow.webContents.openDevTools()

  mainWindow.loadURL('http://localhost:8080')
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}
// console.log(app);
app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

// Receive messages sent asynchronously by the rendering process
ipcMain.on('songURL', (e, data) => {
  downloadSong(data)
})

const { app, BrowserWindow, Menu, ipcMain } = require('electron');

const url = require("url");
const path = require("path");

var downloadSong = require("./soundcloud.js").func;

require("./menu.js")

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true, enableRemoteModule: true,
            contextIsolation: false,
        }
    })

    mainWindow.webContents.openDevTools()

    mainWindow.loadURL("http://localhost:8080");
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
ipcMain.on("songURL",(e,data)=>{
    console.log(data);
    downloadSong(data)
});
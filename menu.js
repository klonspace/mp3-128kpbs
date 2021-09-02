const { app, BrowserWindow, Menu, ipcMain } = require('electron');

function createMenu() {

    var menu = Menu.buildFromTemplate([
        {
            label: 'Menu',
            submenu: [
                {
                    label: 'Home',
                    click() {
                        console.log("Navigate to Home");
                        mainWindow.webContents.send('goToHome');
                    }

                },
                {
                    label: 'About',
                    click() {
                        console.log("Navigate to About");
                        mainWindow.webContents.send('goToAbout');
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
    Menu.setApplicationMenu(menu);
}

createMenu();
import { app, Menu } from "electron"

function createMenu (window) {
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

export default createMenu;

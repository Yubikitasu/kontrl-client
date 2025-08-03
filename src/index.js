const { app, BrowserWindow, session, desktopCapturer } = require('electron')
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1080,
    height: 750,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        devTools: !app.isPackaged
    }
  })
    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
        // // Grant access to the first screen found.
        callback({ video: sources[0], audio: 'loopback' })
    })

    
    // If true, use the system picker if available.
    // Note: this is currently experimental. If the system picker
    // is available, it will be used and the media request handler
    // will not be invoked.
  }, { useSystemPicker: true })

  win.loadFile("index.html")
  win.setResizable(false);
}

app.whenReady().then(() => {
  createWindow()
})
const { app, BrowserWindow, session, desktopCapturer } = require('electron')
const path = require('path');


const createWindow = () => {
  const win = new BrowserWindow()

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
        // Grant access to the first screen found.
        callback({ video: sources[0], audio: 'loopback' })
    })
    // If true, use the system picker if available.
    // Note: this is currently experimental. If the system picker
    // is available, it will be used and the media request handler
    // will not be invoked.
  }, { useSystemPicker: true })

  win.loadURL("http://localhost:5173");
}

app.whenReady().then(() => {
  createWindow()
})
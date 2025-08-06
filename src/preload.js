const { contextBridge, ipcRenderer } = require('electron');

// Creating a bridge to expose the input API to the renderer process
// This will allow the renderer process to send mouse and keyboard events to the main process
contextBridge.exposeInMainWorld('inputApi', {
  moveMouse: (x, y) => ipcRenderer.send('move-mouse', x, y),
  pressButton: (button) => ipcRenderer.send("mousedown", button),
  releaseButton: (button) => ipcRenderer.send("mouseup", button),
  pressKey: (key) => ipcRenderer.send("keydown", key),
  releaseKey: (key) => ipcRenderer.send("keyup", key),
});
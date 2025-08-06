const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('inputApi', {
  moveMouse: (x, y) => ipcRenderer.send('move-mouse', x, y),
  pressButton: (button) => ipcRenderer.send("mousedown", button),
  releaseButton: (button) => ipcRenderer.send("mouseup", button),
  pressKey: (key) => ipcRenderer.send("keydown", key),
  releaseKey: (key) => ipcRenderer.send("keyup", key),
});
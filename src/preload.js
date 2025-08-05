const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mouseApi', {
  moveMouse: (x, y) => ipcRenderer.send('move-mouse', x, y),
  pressButton: (button) => ipcRenderer.send("mousedown", button),
  releaseButton: (button) => ipcRenderer.send("mouseup", button)
});
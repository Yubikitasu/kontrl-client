const {
  app,
  BrowserWindow,
  session,
  desktopCapturer,
  ipcMain,
} = require("electron");
const { mouse, Button, Point, keyboard, Key } = require("@nut-tree-fork/nut-js");

const path = require("path");

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 1080,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: !app.isPackaged,
    },
  });
  session.defaultSession.setDisplayMediaRequestHandler(
    (request, callback) => {
      desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
        // // Grant access to the first screen found.
        callback({ video: sources[0], audio: "loopback" });
      });

      // If true, use the system picker if available.
      // Note: this is currently experimental. If the system picker
      // is available, it will be used and the media request handler
      // will not be invoked.
    },
    { useSystemPicker: true }
  );

  win.loadFile("index.html");
  win.setResizable(false);
};

app.whenReady().then(() => {
  createWindow();
});

// Respond to renderer's mouse move request
ipcMain.on("move-mouse", async (event, x, y) => {
  // robot.moveMouse(x, y);
  await mouse.setPosition(new Point(x, y));
});

let mousePressed = false;
let keyPressed = false;

ipcMain.on("mousedown", async (event, button) => {
  if (mousePressed === false) {
    if (button === "left") {
      await mouse.pressButton(Button.LEFT);
    }

    if (button === "right") {
      await mouse.pressButton(Button.RIGHT);
    }

    if (button === "middle") {
      await mouse.pressButton(Button.MIDDLE);
    }
    console.log("button pressed");
    mousePressed = true;
  }
});

ipcMain.on("mouseup", async (event, button) => {
  if (mousePressed === true) {
    if (button === "left") {
      await mouse.releaseButton(Button.LEFT);
    }

    if (button === "right") {
      await mouse.releaseButton(Button.RIGHT);
    }

    if (button === "middle") {
      await mouse.releaseButton(Button.MIDDLE);
    }
    console.log("button released");
    mousePressed = false;
  }
});

const specialKeyMap = {
  "ENTER": "Enter",
  " ": "Space",
  "TAB": "Tab",
  "SHIFT": "Shift",
  "CTRL": "LeftControl",
  "CONTROL": "LeftControl",
  "ALT": "LeftAlt",
  "ESC": "Escape",
  "ESCAPE": "Escape",
  "UP": "Up",
  "DOWN": "Down",
  "LEFT": "Left",
  "RIGHT": "Right",
  "BACKSPACE": "Backspace",
  "DELETE": "Delete",
  "CAPSLOCK": "CapsLock",
  "F1": "F1",
  "F2": "F2",
  "F3": "F3",
  // Symbol aliases
  ".": "Period",
  ",": "Comma",
  "/": "Slash",
  "\\": "Backslash",
  "-": "Minus",
  "=": "Equal",
  ";": "Semicolon",
  "'": "Quote",
  "[": "LeftBracket",
  "]": "RightBracket",
  "`": "Backquote",
};

ipcMain.on("keydown", async (event, key) => {
  const normalized = key.toUpperCase();

  const mappedKeyName = specialKeyMap[normalized] || normalized;

  await keyboard.pressKey(Key[mappedKeyName]);
  console.log("key pressed: ", Key[mappedKeyName]);
});

ipcMain.on("keyup", async (event, key) => {
  const normalized = key.toUpperCase();

  const mappedKeyName = specialKeyMap[normalized] || normalized;

  await keyboard.releaseKey(Key[mappedKeyName]);
  console.log("key released: ", Key[mappedKeyName]);
});

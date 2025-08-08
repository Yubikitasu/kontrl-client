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
  await mouse.setPosition(new Point(x, y));
});

// Handle mouse button press and release events
// This prevents multiple presses of the same button without release
let mousePressed = false;

// Since we can only use NutJS in the preload process,
// we need to handle key events in the main process with ipcMain.
ipcMain.on("mousedown", async (event, button) => {
  // Only press the button if it is not already pressed
  // This prevents multiple presses of the same button without release
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
  // Only release the button if it was pressed
  // This prevents releasing a button that wasn't pressed
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

// Handle keyboard events, mapping special keys to their Nut.js equivalents
function mappedKey(input) {
  const digitToKeyMap = {
    "0": "Num0",
    "1": "Num1",
    "2": "Num2",
    "3": "Num3",
    "4": "Num4",
    "5": "Num5",
    "6": "Num6",
    "7": "Num7",
    "8": "Num8",
    "9": "Num9",
  };

  const shiftedMap = {
    "!": "Num1",
    "@": "Num2",
    "#": "Num3",
    "$": "Num4",
    "%": "Num5",
    "^": "Num6",
    "&": "Num7",
    "*": "Num8",
    "(": "Num9",
    ")": "Num0",
    "_": "Minus",
    "+": "Equal",
    "{": "LeftBracket",
    "}": "RightBracket",
    "|": "Backslash",
    ":": "Semicolon",
    "\"": "Quote",
    "<": "Comma",
    ">": "Period",
    "?": "Slash",
    "~": "Backquote",
  };
  const specialKeyMap = {
    "ENTER": "Enter",
    " ": "Space",
    "TAB": "Tab",
    "SHIFT": "LeftShift",
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
    "ARROWRIGHT": "Right",
    "ARROWLEFT": "Left", 
    "ARROWUP": "Up",
    "ARROWDOWN": "Down",
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

  const trimmed = input;

  // 1. Shifted symbols (like !@#)
  if (shiftedMap[trimmed]) {
    const keyName = shiftedMap[trimmed];
    const key = Key[keyName];
    if (!key) throw new Error(`Invalid shifted key: "${trimmed}"`);
    return { key, shift: true };
  }

  // 2. Digits 0–9
  if (digitToKeyMap[trimmed]) {
    const keyName = digitToKeyMap[trimmed];
    const key = Key[keyName];
    if (!key) throw new Error(`Invalid digit key: "${trimmed}"`);
    return { key, shift: false };
  }

  // 3. A–Z letters
  if (/^[a-zA-Z]$/.test(trimmed)) {
    const upper = trimmed.toUpperCase();
    const key = Key[upper];
    if (!key) throw new Error(`Invalid letter key: "${trimmed}"`);
    const shift = trimmed !== upper;
    return { key, shift };
  }

  // 4. Special keys
  const upper = trimmed.toUpperCase();
  const keyName = specialKeyMap[upper] || upper;
  const key = Key[keyName];
  if (!key) throw new Error(`Unknown key input: "${input}"`);
  return { key, shift: false };
}

ipcMain.on("keydown", async (event, key) => {
  // Normalize the key to uppercase to match the specialKeyMap
  // This allows for case-insensitive matching, since NutJS keys are uppercase
  const normalized = key.toUpperCase();
  if (mappedKey(normalized).shift) {
    await keyboard.pressKey(Key.Shift, mappedKey(normalized).key);
  } else {
    await keyboard.pressKey(mappedKey(normalized).key);
  }
  console.log("key pressed: ", mappedKey(normalized).key);
});

ipcMain.on("keyup", async (event, key) => {
  const normalized = key.toUpperCase();

  if (mappedKey(normalized).shift) {
    await keyboard.releaseKey(Key.Shift, mappedKey(normalized).key);
  } else {
    await keyboard.releaseKey(mappedKey(normalized).key);
  }
  console.log("key released: ", mappedKey(normalized).key);
});

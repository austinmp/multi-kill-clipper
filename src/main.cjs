const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path                                    = require('path');

if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname);
}

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer', 'index.js'),
    },
  });
  // win.webContents.openDevTools();
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function listenForRendererEvents() {
  ipcMain.on('cancelRequest', () => {
    win.webContents.reloadIgnoringCache();
  });
}

app.whenReady().then(() => {
  app.allowRendererProcessReuse = false;
  createWindow();
  listenForRendererEvents();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

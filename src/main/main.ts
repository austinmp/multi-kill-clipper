/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import EventService from './app/models/event-service';
import { EVENT_SERVICE_CHANNEL } from './app/constants';
import IPC_CHANNEL_TO_HANDLER from './ipc/ipc-channel-to-handler';
import IPC_CHANNEL from './ipc/ipc-channels';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1366,
    height: 768,
    icon: getAssetPath('/icons/gwen-256x256.png'),
    webPreferences: {
      contextIsolation: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

// Set up custom Multi Kill Clipper IPC handlers
ipcMain.on(
  IPC_CHANNEL.OPEN_FILE,
  IPC_CHANNEL_TO_HANDLER[IPC_CHANNEL.OPEN_FILE],
);

ipcMain.handle(
  IPC_CHANNEL.GET_MULTI_KILLS,
  IPC_CHANNEL_TO_HANDLER[IPC_CHANNEL.GET_MULTI_KILLS],
);

ipcMain.handle(
  IPC_CHANNEL.GET_HIGHLIGHTS_PATH,
  IPC_CHANNEL_TO_HANDLER[IPC_CHANNEL.GET_HIGHLIGHTS_PATH],
);
ipcMain.handle(
  IPC_CHANNEL.GET_LOGGED_IN_SUMMONER,
  IPC_CHANNEL_TO_HANDLER[IPC_CHANNEL.GET_LOGGED_IN_SUMMONER],
);
ipcMain.handle(
  IPC_CHANNEL.CREATE_CLIP,
  IPC_CHANNEL_TO_HANDLER[IPC_CHANNEL.CREATE_CLIP],
);

const subscribeToMainProcessEvents = () => {
  // Subscribe to backend events for clipping progress
  EventService.subscribe(EVENT_SERVICE_CHANNEL.CLIP_PROGRESS, (data: any) => {
    // When 'someEvent' occurs, send data to the renderer process
    if (mainWindow) {
      mainWindow.webContents.send(EVENT_SERVICE_CHANNEL.CLIP_PROGRESS, data);
    }
  });

  // Subscribe to backend events for clipping complete
  EventService.subscribe(
    EVENT_SERVICE_CHANNEL.CLIPPING_COMPLETE,
    (data: any) => {
      // When 'someEvent' occurs, send data to the renderer process
      if (mainWindow) {
        mainWindow.webContents.send(
          EVENT_SERVICE_CHANNEL.CLIPPING_COMPLETE,
          data,
        );
      }
    },
  );
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    subscribeToMainProcessEvents();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

import { app, BrowserWindow, nativeTheme, shell } from 'electron';
// import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bindIpcApiFunctions } from './api';
import { setTheme } from './api/app';
import { client } from './api/discord/client';
import { bindIpcDiscordApiEvents } from './api/discord/events';

// const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

const createWindow = () => {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    titleBarStyle: 'hidden',
    titleBarOverlay: {},
    width: 1200,
    height: 750,
    backgroundMaterial: 'mica',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(`${VITE_DEV_SERVER_URL}#auth`);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'auth' });
  }

  win.webContents.setWindowOpenHandler(({ url, referrer }) => {
    if (new URL(url).origin !== new URL(referrer.url).origin) {
      shell.openExternal(url);
      return { action: 'deny' };
    }

    return { action: 'allow' };
  });

  bindIpcApiFunctions();
  bindIpcDiscordApiEvents(win.webContents);
};

const subscribeToThemeUpdate = () => {
  const handleThemeUpdate = () => {
    win?.setTitleBarOverlay({
      color: nativeTheme.shouldUseDarkColors ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
      symbolColor: nativeTheme.shouldUseDarkColors ? 'white' : 'black',
      height: 30,
    });
  };

  nativeTheme.on('updated', handleThemeUpdate);
  handleThemeUpdate();

  setTheme(undefined, 'dark');
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('before-quit', async () => {
  await client.destroy();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();
  subscribeToThemeUpdate();
});

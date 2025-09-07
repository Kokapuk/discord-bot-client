import { ElectronBlocker } from '@ghostery/adblocker-electron';
import { app, BrowserWindow, nativeTheme, session, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleIpcMainAutoInvokeEvents, handleIpcMainEvents } from './ipc';
import { logout } from './ipc/client/utils';
import handleThemeUpdate from './utils/handleThemeUpdate';
import preventBackgroundThrottling from './utils/preventBackgroundThrottling';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let window: BrowserWindow | null;

const createWindow = () => {
  window = new BrowserWindow({
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
    window.loadURL(`${VITE_DEV_SERVER_URL}#auth`);
  } else {
    window.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'auth' });
  }
};

const handleThirdPartLinks = () => {
  window!.webContents.setWindowOpenHandler(({ url, referrer }) => {
    if (new URL(url).origin !== new URL(referrer.url).origin) {
      shell.openExternal(url);
      return { action: 'deny' };
    }

    return { action: 'allow' };
  });
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    window = null;
  }
});

app.on('before-quit', () => {
  logout();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();

  nativeTheme.themeSource = 'dark';
  handleThemeUpdate(window!, 32);

  handleThirdPartLinks();
  handleIpcMainEvents();
  handleIpcMainAutoInvokeEvents(window!.webContents);
  preventBackgroundThrottling(window!);

  ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
    blocker.enableBlockingInSession(session.defaultSession);
  });
});

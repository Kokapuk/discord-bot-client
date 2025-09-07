import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleIpcMainAutoInvokeEvents, handleIpcMainEvents } from './ipc';
import { logout } from './ipc/client/utils';
import createAppWindow from './windows/app';
import createBackgroundThrottlingBlocker from './windows/backgroundThrottlingBlocker';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let appWindow: BrowserWindow | null;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    appWindow = null;
  }
});

app.on('before-quit', () => {
  logout();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    appWindow = createAppWindow();
  }
});

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';

  appWindow = createAppWindow();
  createBackgroundThrottlingBlocker(appWindow);

  handleIpcMainEvents();
  handleIpcMainAutoInvokeEvents(appWindow.webContents);
});

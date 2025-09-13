import { BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleIpcMainAutoInvokeEvents, handleIpcMainEvents } from '../ipc';
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from '../main';
import handleThemeUpdate from '../utils/handleThemeUpdate';
import handleThirdPartyLinks from '../utils/handleThirdPartyLinks';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createAppWindow = () => {
  const window = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, '/images/icon.ico'),
    titleBarStyle: 'hidden',
    titleBarOverlay: {},
    width: 1200,
    height: 750,
    minWidth: 800,
    minHeight: 500,
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

  handleIpcMainEvents();
  handleIpcMainAutoInvokeEvents(window.webContents);

  handleThemeUpdate(window, 32);
  handleThirdPartyLinks(window);

  return window;
};

export default createAppWindow;

import { BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from '../main';
import handleThemeUpdate from '../utils/handleThemeUpdate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const handleThirdPartyLinks = (window: BrowserWindow) => {
  window.webContents.setWindowOpenHandler(({ url, referrer }) => {
    if (new URL(url).origin !== new URL(referrer.url).origin) {
      shell.openExternal(url);
      return { action: 'deny' };
    }

    return { action: 'allow' };
  });
};

const createAppWindow = () => {
  const window = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
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

  handleThemeUpdate(window, 32);
  handleThirdPartyLinks(window);

  return window;
};

export default createAppWindow;

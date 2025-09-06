import { BrowserWindow, WebContentsView } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleIpcMainAutoInvokeEvents, handleIpcMainEvents } from '../ipc/miniBrowser/handle';
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from '../main';
import handleThemeUpdate from './handleThemeUpdate';

const TITLE_BAR_HEIGHT = 40;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fitWebContentsViewToWindow = (webContentsView: WebContentsView, window: BrowserWindow) => {
  const [width, height] = window.getContentSize();

  webContentsView.setBounds({ x: 0, y: TITLE_BAR_HEIGHT, width, height: height - TITLE_BAR_HEIGHT });
};

const createAudioCaptureWindow = (parent: BrowserWindow) => {
  const window = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 900,
    height: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {},
    backgroundMaterial: 'mica',
    alwaysOnTop: true,
    minimizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  const handleParentClose = () => {
    window.close();
  };

  parent.on('close', handleParentClose);

  if (VITE_DEV_SERVER_URL) {
    window.loadURL(`${VITE_DEV_SERVER_URL}#miniBrowser`);
  } else {
    window.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'miniBrowser' });
  }

  handleThemeUpdate(window, TITLE_BAR_HEIGHT);

  const view = new WebContentsView();
  view.webContents.setBackgroundThrottling(false);
  window.contentView.addChildView(view);
  view.webContents.loadURL('https://google.com');

  window.on('resize', () => fitWebContentsViewToWindow(view, window));
  fitWebContentsViewToWindow(view, window);

  const removeHandlers = handleIpcMainEvents(view.webContents);
  const unsubscribe = handleIpcMainAutoInvokeEvents(window.webContents, view.webContents);

  window.once('close', () => {
    parent.off('close', handleParentClose);

    if (!view.webContents.isDestroyed()) {
      view.webContents.close();
    }

    removeHandlers();
    unsubscribe();
  });

  window.on('blur', () => {
    window.setOpacity(0);
    window.setIgnoreMouseEvents(true);
  });

  window.on('focus', () => {
    window.setOpacity(1);
    window.setIgnoreMouseEvents(false);
  });

  return { window, webFrameMain: view.webContents.mainFrame };
};

export default createAudioCaptureWindow;

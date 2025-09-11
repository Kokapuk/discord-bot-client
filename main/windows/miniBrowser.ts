import { BrowserWindow, WebContentsView } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleIpcMainAutoInvokeEvents, handleIpcMainEvents } from '../ipc/miniBrowser/handle';
import { handleIpcMainAutoInvokeEvents as handleIpcMainAutoInvokeSettingsEvents } from '../ipc/settings/handle';
import { RENDERER_DIST, VITE_DEV_SERVER_URL } from '../main';
import handleThemeUpdate from '../utils/handleThemeUpdate';

const TITLE_BAR_HEIGHT = 40;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createWebContentsView = () => {
  const view = new WebContentsView();
  view.webContents.setBackgroundThrottling(false);
  view.webContents.loadURL('https://google.com');

  return view;
};

const fitWebContentsViewToWindow = (webContentsView: WebContentsView, window: BrowserWindow) => {
  const [width, height] = window.getContentSize();

  webContentsView.setBounds({ x: 0, y: TITLE_BAR_HEIGHT, width, height: height - TITLE_BAR_HEIGHT });
};

const createMiniBrowserWindow = (parent: BrowserWindow) => {
  const window = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, '/images/icon.ico'),
    width: 900,
    height: 600,
    minWidth: 500,
    minHeight: 400,
    titleBarStyle: 'hidden',
    titleBarOverlay: {},
    backgroundMaterial: 'mica',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  if (VITE_DEV_SERVER_URL) {
    window.loadURL(`${VITE_DEV_SERVER_URL}#miniBrowser`);
  } else {
    window.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'miniBrowser' });
  }

  handleThemeUpdate(window, TITLE_BAR_HEIGHT);

  const view = createWebContentsView();
  window.contentView.addChildView(view);
  window.on('resize', () => fitWebContentsViewToWindow(view, window));
  fitWebContentsViewToWindow(view, window);

  const removeHandlers = handleIpcMainEvents(view.webContents);
  const unsubscribeMiniBrowserEvents = handleIpcMainAutoInvokeEvents(window.webContents, view.webContents);
  const unsubscribeSettingsEvents = handleIpcMainAutoInvokeSettingsEvents(window.webContents);

  const handleParentClose = () => {
    window.close();
  };
  parent.on('close', handleParentClose);
  window.once('close', () => {
    parent.off('close', handleParentClose);

    if (!view.webContents.isDestroyed()) {
      view.webContents.close();
    }

    removeHandlers();
    unsubscribeMiniBrowserEvents();
    unsubscribeSettingsEvents();
  });

  return { window, webFrameMain: view.webContents.mainFrame };
};

export default createMiniBrowserWindow;

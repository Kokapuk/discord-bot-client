import { WebContents } from 'electron';
import { MiniBrowserIpcSlice } from '.';
import { createIpcMain } from '../../utils/createIpcMain';
import { isStringUrl, structNavigationData } from './utils';

export const ipcMain = createIpcMain<MiniBrowserIpcSlice>();

export const handleIpcMainEvents = (viewWebContents: WebContents) => {
  ipcMain.handle('getInitialNavigationData', () => structNavigationData(viewWebContents));

  ipcMain.handle('loadUrl', (_, url) => {
    if (isStringUrl(url)) {
      viewWebContents.loadURL(url);
    } else {
      viewWebContents.loadURL(`https://www.google.com/search?q=${encodeURIComponent(url)}`);
    }
  });

  ipcMain.handle('goBack', () => {
    viewWebContents.navigationHistory.goBack();
  });

  ipcMain.handle('goForward', () => {
    viewWebContents.navigationHistory.goForward();
  });

  ipcMain.handle('reload', () => {
    viewWebContents.reload();
  });

  return () => {
    ipcMain.removeHandler('getInitialNavigationData');
    ipcMain.removeHandler('loadUrl');
    ipcMain.removeHandler('goBack');
    ipcMain.removeHandler('goForward');
    ipcMain.removeHandler('reload');
  };
};

export const handleIpcMainAutoInvokeEvents = (windowWebContents: WebContents, viewWebContents: WebContents) => {
  const navigationHandler = () => {
    ipcMain.send(windowWebContents, 'navigate', structNavigationData(viewWebContents));
  };

  viewWebContents.on('will-navigate', navigationHandler);
  viewWebContents.on('did-start-navigation', navigationHandler);
  viewWebContents.on('did-navigate', navigationHandler);
  viewWebContents.on('will-frame-navigate', navigationHandler);
  viewWebContents.on('did-frame-navigate', navigationHandler);
  viewWebContents.on('will-redirect', navigationHandler);
  viewWebContents.on('did-redirect-navigation', navigationHandler);

  return () => {
    viewWebContents.off('will-navigate', navigationHandler);
    viewWebContents.off('did-start-navigation', navigationHandler);
    viewWebContents.off('did-navigate', navigationHandler);
    viewWebContents.off('will-frame-navigate', navigationHandler);
    viewWebContents.off('did-frame-navigate', navigationHandler);
    viewWebContents.off('will-redirect', navigationHandler);
    viewWebContents.off('did-redirect-navigation', navigationHandler);
  };
};

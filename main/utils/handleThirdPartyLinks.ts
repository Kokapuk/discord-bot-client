import { BrowserWindow, shell } from 'electron';

const handleThirdPartyLinks = (window: BrowserWindow) => {
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

export default handleThirdPartyLinks;

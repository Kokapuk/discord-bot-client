import { BrowserWindow } from 'electron';
import path from 'node:path';

const createAudioCaptureWindow = (parent: BrowserWindow) => {
  const window = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      backgroundThrottling: false,
    },
  });

  parent.once('close', () => {
    window.close();
  });

  window.loadURL('https://youtube.com');

  return window;
};

export default createAudioCaptureWindow;

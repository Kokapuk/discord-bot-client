import { BrowserWindow } from 'electron';

const createBackgroundThrottlingBlocker = (parent: BrowserWindow) => {
  const window = new BrowserWindow({
    width: 1,
    height: 1,
    alwaysOnTop: true,
    opacity: 0,
    skipTaskbar: true,
  });

  window.setIgnoreMouseEvents(true);

  parent.on('close', () => window.close());
};

export default createBackgroundThrottlingBlocker;

import { createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';
import { app, BrowserWindow, session, WebContents } from 'electron';
import { createRequire } from 'module';
import path from 'path';
import { PassThrough } from 'stream';
import createMiniBrowserWindow from '../../windows/miniBrowser';
import { ipcMain } from './handle';

const require = createRequire(import.meta.url);

const { startAudioCapture, stopAudioCapture } = require(process.env['VITE_DEV_SERVER_URL']
  ? 'application-loopback'
  : path.join(path.parse(app.getPath('exe')).dir, './resources/app.asar.unpacked/node_modules/application-loopback'));

let audioCaptureWindow: BrowserWindow | null = null;
let capturingProcessId: string | null = null;
let capturingSilenceInterval: NodeJS.Timeout | null = null;

export const audioPlayer = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
});
export const audioOutputStream: { current: PassThrough | null } = { current: null };

export const startHandlingOutputAudioSystemwideSource = async () => {
  session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
    callback({ audio: 'loopback' });
  });
};

export const startHandlingOutputAudioIsolatedExternalSource = async (window: BrowserWindow, enableLocalEcho?: true) => {
  return await new Promise<void>((resolve) =>
    session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
      const audioCaptureWindowData = createMiniBrowserWindow(window);
      audioCaptureWindow = audioCaptureWindowData.window;

      callback({ audio: audioCaptureWindowData.webFrameMain, enableLocalEcho: enableLocalEcho });

      audioCaptureWindow.once('closed', () => {
        if (!window.isDestroyed()) {
          stopHandlingAudioOutputSource(window.webContents);
        }
      });

      resolve();
    })
  );
};

export const startHandlingOutputAudioIsolatedCaptureSource = async (processId: string) => {
  if (capturingProcessId) {
    return;
  }

  capturingProcessId = processId;

  let lastDataTs = Date.now();

  startAudioCapture(capturingProcessId, {
    onData: (chunk: Uint8Array) => {
      lastDataTs = Date.now();
      audioOutputStream.current?.push(chunk);
    },
  });

  capturingSilenceInterval = setInterval(() => {
    if (Date.now() - lastDataTs > 30) {
      audioOutputStream.current?.push(Buffer.alloc(3840));
    }
  }, 20);
};

export const stopHandlingAudioOutputIsolatedExternalSource = () => {
  if (audioCaptureWindow && !audioCaptureWindow.isDestroyed()) {
    audioCaptureWindow.close();
  }

  audioCaptureWindow = null;
};

export const stopHandlingOutputAudioIsolatedCaptureSource = async () => {
  capturingSilenceInterval && clearInterval(capturingSilenceInterval);
  capturingProcessId && stopAudioCapture(capturingProcessId);

  capturingSilenceInterval = null;
  capturingProcessId = null;
};

export const stopHandlingAudioOutputSource = async (webContents: WebContents) => {
  stopHandlingAudioOutputIsolatedExternalSource();
  stopHandlingOutputAudioIsolatedCaptureSource();

  session.defaultSession.setDevicePermissionHandler(null);

  try {
    ipcMain.send(webContents, 'audioOutputHandlingStop');
    audioPlayer.stop();
    audioOutputStream.current?.end();
    audioOutputStream.current = null;
  } catch {}
};

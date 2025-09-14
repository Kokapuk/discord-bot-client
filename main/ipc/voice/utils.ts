import { createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';
import { BrowserWindow, session, WebContents } from 'electron';
import { createRequire } from 'module';
import { PassThrough } from 'stream';
import createMiniBrowserWindow from '../../windows/miniBrowser';
import { ipcMain } from './handle';

const require = createRequire(import.meta.url);

const { startLoopbackCapture, stopLoopbackCapture } = require('@kokapuk/application-loopback');

let audioCaptureWindow: BrowserWindow | null = null;

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

export const startHandlingOutputAudioIsolatedExternalSource = async (
  window: BrowserWindow,
  enableLocalEcho?: boolean
) => {
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

export const startHandlingOutputAudioIsolatedCaptureSource = (processId: number, onFinish?: () => void) => {
  startLoopbackCapture(processId, (chunk: Uint8Array) => audioOutputStream.current?.push(chunk), onFinish);
};

export const stopHandlingAudioOutputIsolatedExternalSource = () => {
  if (audioCaptureWindow && !audioCaptureWindow.isDestroyed()) {
    audioCaptureWindow.close();
  }

  audioCaptureWindow = null;
};

export const stopHandlingOutputAudioIsolatedCaptureSource = async () => {
  stopLoopbackCapture();
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

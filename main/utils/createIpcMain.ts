import { ipcMain, IpcMainInvokeEvent, WebContents } from 'electron';
import { IpcSlice } from './ipc';

export const createIpcMain = <T extends IpcSlice>() => {
  type RendererToMain = NonNullable<T['rendererToMain']>;
  type MainToRenderer = NonNullable<T['mainToRenderer']>;

  return {
    send: <C extends keyof MainToRenderer>(
      webContents: WebContents,
      channel: C,
      ...args: Parameters<MainToRenderer[C]>
    ) => {
      webContents.send(channel as string, ...args);
    },

    handle: <C extends keyof RendererToMain>(
      channel: C,
      listener: (event: IpcMainInvokeEvent, ...args: Parameters<RendererToMain[C]>) => void
    ) => {
      ipcMain.handle(channel as string, listener);
    },

    removeHandler: <C extends keyof RendererToMain>(channel: C) => ipcMain.removeHandler(channel as string),
  };
};

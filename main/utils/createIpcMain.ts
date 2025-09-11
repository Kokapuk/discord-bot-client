import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, WebContents } from 'electron';
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
      listener: (event: IpcMainInvokeEvent, ...args: Parameters<RendererToMain[C]>) => ReturnType<RendererToMain[C]>
    ) => {
      ipcMain.handle(channel as string, listener);
    },

    removeHandler: <C extends keyof RendererToMain>(channel: C) => ipcMain.removeHandler(channel as string),

    on: <C extends keyof RendererToMain>(
      channel: C,
      listener: (event: IpcMainEvent, ...args: Parameters<RendererToMain[C]>) => any
    ) => {
      ipcMain.on(channel as string, listener);

      return () => ipcMain.off(channel as string, listener);
    },
  };
};

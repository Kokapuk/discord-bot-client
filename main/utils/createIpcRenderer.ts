import { ipcRenderer, IpcRendererEvent } from 'electron';
import { IpcSlice } from './ipc';

export const createIpcRenderer = <T extends IpcSlice>() => {
  type RendererToMain = NonNullable<T['rendererToMain']>;
  type MainToRenderer = NonNullable<T['mainToRenderer']>;

  return {
    invoke: <C extends keyof RendererToMain>(channel: C, ...args: Parameters<RendererToMain[C]>) => {
      return ipcRenderer.invoke(channel as string, ...args) as ReturnType<RendererToMain[C]>;
    },

    on: <C extends keyof MainToRenderer>(
      channel: C,
      listener: (event: IpcRendererEvent, ...args: Parameters<MainToRenderer[C]>) => ReturnType<MainToRenderer[C]>
    ) => {
      ipcRenderer.on(channel as string, listener);

      return () => {
        ipcRenderer.off(channel as string, listener);
      };
    },

    once: <C extends keyof MainToRenderer>(
      channel: C,
      listener: (event: IpcRendererEvent, ...args: Parameters<MainToRenderer[C]>) => ReturnType<MainToRenderer[C]>
    ) => {
      ipcRenderer.once(channel as string, listener);
    },
  };
};

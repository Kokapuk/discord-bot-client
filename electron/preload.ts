import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron';

const ipcRendererApi = {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;

    const handler = (event: IpcRendererEvent, ...args: any[]) => listener(event, ...args);

    ipcRenderer.on(channel, handler);

    return () => {
      ipcRenderer.off(channel, handler);
    };
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
};

export type ExposedIpcRendererApi = typeof ipcRendererApi;

contextBridge.exposeInMainWorld('ipcRenderer', ipcRendererApi);

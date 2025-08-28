import { IpcMainDiscordApiEvents } from '@main/api/discord/events';

export const handleIpcRendererDiscordApiEvents = (keys: (keyof IpcMainDiscordApiEvents)[], callback: () => void) => {
  const unsubscribes = keys.map((key) => window.ipcRenderer.on(key, callback));

  return () => {
    unsubscribes.forEach((fn) => fn());
  };
};

export const handleIpcRendererDiscordApiEventWithPayload = <T extends keyof IpcMainDiscordApiEvents>(
  key: T,
  callback: (...args: IpcMainDiscordApiEvents[T]) => void
) => {
  const unsubscribe = window.ipcRenderer.on(key, (_, ...args: IpcMainDiscordApiEvents[T]) => callback(...args));

  return unsubscribe;
};

import { IpcMainDiscordApiFunctions, IpcMainDiscordApiEvents } from '../../electron/api/discord';

const completedDiscordApiFunctionKeys = <T extends (keyof IpcMainDiscordApiFunctions)[]>(
  arr: T &
    ([keyof IpcMainDiscordApiFunctions] extends [T[number]]
      ? unknown
      : [never, Exclude<keyof IpcMainDiscordApiFunctions, T[number]>])
) => arr;

const ipcMainDiscordApiFunctionsKeys = completedDiscordApiFunctionKeys(['authorize', 'getGuilds', 'getGuildChannels']);

export const ipcRendererDiscordApiFunctions = Object.fromEntries(
  ipcMainDiscordApiFunctionsKeys.map((key) => [
    key,
    async (...args: any) => await window.ipcRenderer.invoke(key, ...args),
  ])
) as unknown as IpcMainDiscordApiFunctions;

export const handleIpcRendererDiscordApiEvents = (keys: IpcMainDiscordApiEvents[], callback: () => void) => {
  keys.forEach((key) => window.ipcRenderer.on(key, callback));

  return () => keys.forEach((key) => window.ipcRenderer.off(key, callback));
};

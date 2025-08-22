import { IpcMainDiscordApiFunctions, IpcMainDiscordApiEvents } from '@main/api/discord';

const completedDiscordApiFunctionKeys = <T extends (keyof IpcMainDiscordApiFunctions)[]>(
  arr: T &
    ([keyof IpcMainDiscordApiFunctions] extends [T[number]]
      ? unknown
      : [never, Exclude<keyof IpcMainDiscordApiFunctions, T[number]>])
) => arr;

const ipcMainDiscordApiFunctionsKeys = completedDiscordApiFunctionKeys([
  'authorize',
  'getGuilds',
  'getGuildChannels',
  'getGuildMembers',
  'getGuildRoles',
  'fetchChannelsMessages',
]);

export const ipcRendererDiscordApiFunctions = Object.fromEntries(
  ipcMainDiscordApiFunctionsKeys.map((key) => [
    key,
    async (...args: any) => await window.ipcRenderer.invoke(key, ...args),
  ])
) as unknown as IpcMainDiscordApiFunctions;

export const handleIpcRendererDiscordApiEvents = (keys: IpcMainDiscordApiEvents[], callback: () => void) => {
  const unsubscribes = keys.map((key) => window.ipcRenderer.on(key, callback));

  return () => {
    unsubscribes.forEach((fn) => fn());
  };
};

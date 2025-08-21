import { IpcMainDiscordApiFunctions } from '../../electron/api/discord';

const completedDiscordApiFunctionKeys = <T extends (keyof IpcMainDiscordApiFunctions)[]>(
  arr: T &
    ([keyof IpcMainDiscordApiFunctions] extends [T[number]]
      ? unknown
      : ['Missing', Exclude<keyof IpcMainDiscordApiFunctions, T[number]>])
) => arr;

const ipcMainDiscordApiFunctionsKeys = completedDiscordApiFunctionKeys(['authorize', 'getAllGuilds']);

const ipcRendererDiscordApiFunctions = Object.fromEntries(
  ipcMainDiscordApiFunctionsKeys.map((key) => [key, (...args: any) => window.ipcRenderer.invoke(key, ...args)])
) as unknown as IpcMainDiscordApiFunctions;

export default ipcRendererDiscordApiFunctions;

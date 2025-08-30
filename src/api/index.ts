import { IpcMainApiFunctions } from '@main/api';

const completedApiFunctionKeys = <T extends (keyof IpcMainApiFunctions)[]>(
  arr: T &
    ([keyof IpcMainApiFunctions] extends [T[number]] ? unknown : [never, Exclude<keyof IpcMainApiFunctions, T[number]>])
) => arr;

const ipcMainApiFunctionsKeys = completedApiFunctionKeys([
  // discord
  'authorize',
  'getClient',
  'getGuilds',
  'getGuildChannels',
  'getGuildMembers',
  'getGuildRoles',
  'fetchChannelsMessages',
  'sendMessage',
  'editMessage',
  'deleteMessage',
  'replyToMessage',
  'getGuildVoiceMembers',

  // app
  'setTheme',
]);

export const ipcRendererApiFunctions = Object.fromEntries(
  ipcMainApiFunctionsKeys.map((key) => [key, async (...args: any) => await window.ipcRenderer.invoke(key, ...args)])
) as unknown as IpcMainApiFunctions;

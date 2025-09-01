import { IpcMainApiFunctions } from '@main/api';

const completedApiFunctionKeys = <T extends (keyof IpcMainApiFunctions)[]>(
  arr: T &
    ([keyof IpcMainApiFunctions] extends [T[number]] ? unknown : [never, Exclude<keyof IpcMainApiFunctions, T[number]>])
) => arr;

const ipcMainApiFunctionsKeys = completedApiFunctionKeys([
  // discord
  'authorize',
  'getClient',
  'setClientStatus',
  'getGuilds',
  'getGuildsChannels',
  'getGuildsMembers',
  'getGuildsRoles',
  'fetchChannelMessages',
  'sendMessage',
  'editMessage',
  'deleteMessage',
  'replyToMessage',
  'getGuildsVoiceChannelsMembers',

  // voice,
  'joinVoice',
  'leaveVoice',
  'enableReceiver',
  'disableReceiver',
  'getAudioSources',

  // app
  'setTheme',
]);

export const ipcRendererApiFunctions = Object.fromEntries(
  ipcMainApiFunctionsKeys.map((key) => [key, async (...args: any) => await window.ipcRenderer.invoke(key, ...args)])
) as unknown as IpcMainApiFunctions;

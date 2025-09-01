import { IpcMainEventHandlersToRendererFunctions } from '@main/utils';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { setTheme } from './app';
import {
  authorize,
  deleteMessage,
  editMessage,
  fetchChannelMessages,
  getClient,
  getGuildsChannels,
  getGuildsMembers,
  getGuildsRoles,
  getGuilds,
  getGuildsVoiceChannelsMembers,
  replyToMessage,
  sendMessage,
  setClientStatus,
} from './discord';
import { disableReceiver, enableReceiver, joinVoice, leaveVoice } from './voice';

export type IpcApiResponse<T = void> =
  | (T extends void ? { success: true } : { success: true; payload: T })
  | { success: false; error: string };

const ipcMainApiFunctions = {
  // discord
  authorize,
  getClient,
  setClientStatus,
  getGuilds,
  getGuildsChannels,
  getGuildsMembers,
  getGuildsRoles,
  fetchChannelMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  replyToMessage,
  getGuildsVoiceChannelsMembers,

  // voice
  joinVoice,
  leaveVoice,
  enableReceiver,
  disableReceiver,

  // app
  setTheme,
} satisfies Record<string, (_: IpcMainInvokeEvent, ...args: any[]) => any>;

export type IpcMainApiFunctions = IpcMainEventHandlersToRendererFunctions<typeof ipcMainApiFunctions>;

export const bindIpcApiFunctions = () => {
  Object.keys(ipcMainApiFunctions).map((key) =>
    ipcMain.handle(key, ipcMainApiFunctions[key as keyof IpcMainApiFunctions])
  );
};

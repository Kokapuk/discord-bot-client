import { IpcMainEventHandlersToRendererFunctions } from '@main/utils';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { setTheme } from './app';
import {
  authorize,
  deleteMessage,
  editMessage,
  fetchChannelsMessages,
  getClient,
  getGuildChannels,
  getGuildMembers,
  getGuildRoles,
  getGuilds,
  getGuildVoiceMembers,
  replyToMessage,
  sendMessage,
} from './discord';

export type IpcApiResponse<T = void> =
  | (T extends void ? { success: true } : { success: true; payload: T })
  | { success: false; error: string };

const ipcMainApiFunctions = {
  // discord
  authorize,
  getClient,
  getGuilds,
  getGuildChannels,
  getGuildMembers,
  getGuildRoles,
  fetchChannelsMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  replyToMessage,
  getGuildVoiceMembers,

  // app
  setTheme,
} satisfies Record<string, (_: IpcMainInvokeEvent, ...args: any[]) => any>;

export type IpcMainApiFunctions = IpcMainEventHandlersToRendererFunctions<typeof ipcMainApiFunctions>;

export const bindIpcApiFunctions = () => {
  Object.keys(ipcMainApiFunctions).map((key) =>
    ipcMain.handle(key, ipcMainApiFunctions[key as keyof IpcMainApiFunctions])
  );
};

import { WebContents } from 'electron';
import { handleIpcMainEvents as handleIpcMainAppEvents } from './app/handle';
import { handleIpcMainEvents as handleIpcMainClientEvents } from './client/handle';
import { handleIpcMainEvents as handleIpcMainDmsEvents } from './dms/handle';
import {
  handleIpcMainAutoInvokeEvents as handleIpcMainAutoInvokeAppEvents,
  handleIpcMainEvents as handleIpcMainGuildsEvents,
} from './guilds/handle';
import {
  handleIpcMainAutoInvokeEvents as handleIpcMainAutoInvokeMessagesEvents,
  handleIpcMainEvents as handleIpcMainMessagesEvents,
} from './messages/handle';
import {
  handleIpcMainAutoInvokeEvents as handleIpcMainAutoInvokeSettingsEvents,
  handleIpcMainEvents as handleIpcMainSettingsEvents,
} from './settings/handle';
import {
  handleIpcMainAutoInvokeEvents as handleIpcMainAutoInvokeVoiceEvents,
  handleIpcMainEvents as handleIpcMainVoiceEvents,
} from './voice/handle';

export type IpcApiResponse<T = void> =
  | (T extends void ? { success: true } : { success: true; payload: T })
  | { success: false; error: string };

export const handleIpcMainEvents = () => {
  handleIpcMainAppEvents();
  handleIpcMainClientEvents();
  handleIpcMainGuildsEvents();
  handleIpcMainMessagesEvents();
  handleIpcMainVoiceEvents();
  handleIpcMainSettingsEvents();
  handleIpcMainDmsEvents();
};

export const handleIpcMainAutoInvokeEvents = (webContents: WebContents) => {
  handleIpcMainAutoInvokeAppEvents(webContents);
  handleIpcMainAutoInvokeMessagesEvents(webContents);
  handleIpcMainAutoInvokeVoiceEvents(webContents);
  handleIpcMainAutoInvokeSettingsEvents(webContents);
};

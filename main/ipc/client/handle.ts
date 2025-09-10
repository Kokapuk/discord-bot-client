import { User } from '@main/features/users/types';
import { ActivityType, PresenceUpdateStatus } from 'discord.js';
import { ClientIpcSlice } from '.';
import { IpcApiResponse } from '..';
import { structUser } from '../../features/users/utils';
import { createIpcMain } from '../../utils/createIpcMain';
import { client } from './utils';

const ipcMain = createIpcMain<ClientIpcSlice>();

export const handleIpcMainEvents = () => {
  ipcMain.handle('login', async (_, token) => {
    try {
      await client.login(token);
      await new Promise((res) => client.once('clientReady', res));

      client.user?.setPresence({
        activities: [
          {
            name: 'github.com/Kokapuk/discord-bot-client',
            url: 'https://github.com/Kokapuk/discord-bot-client',
            type: ActivityType.Custom,
          },
        ],
      });

      return { success: true } as IpcApiResponse;
    } catch (err: any) {
      return { success: false, error: err.message } as IpcApiResponse;
    }
  });

  ipcMain.handle('getClientUser', async () => {
    if (!client.user) {
      return { success: false, error: 'Client user does not exist' } as IpcApiResponse<User>;
    }

    return { success: true, payload: structUser(client.user) } as IpcApiResponse<User>;
  });

  ipcMain.handle('setClientStatus', async (_, status) => {
    if (!client.user) {
      return { success: false, error: 'Client user does not exist' } as IpcApiResponse;
    }

    let newStatus = PresenceUpdateStatus.Online;

    switch (status) {
      case 'online':
        newStatus = PresenceUpdateStatus.Online;
        break;
      case 'idle':
        newStatus = PresenceUpdateStatus.Idle;
        break;
      case 'dnd':
        newStatus = PresenceUpdateStatus.DoNotDisturb;
        break;
      case 'invisible':
        newStatus = PresenceUpdateStatus.Invisible;
        break;
    }

    client.user.setPresence({ status: newStatus });

    return { success: true } as IpcApiResponse;
  });
};

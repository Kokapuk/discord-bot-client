import { createIpcMain } from '../../utils/createIpcMain';
import { ActivityType, PresenceUpdateStatus } from 'discord.js';
import { ClientIpcSlice } from '.';
import { client, structUser } from './utils';

const ipcMain = createIpcMain<ClientIpcSlice>();

export const handleIpcMainEvents = () => {
  ipcMain.handle('login', async (_, token) => {
    try {
      await client.login(token);
      await new Promise((res) => client.once('ready', res));

      client.user?.setPresence({
        activities: [
          {
            name: 'github.com/Kokapuk/discord-bot-client',
            url: 'https://github.com/Kokapuk/discord-bot-client',
            type: ActivityType.Custom,
          },
        ],
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('getClientUser', () => {
    if (!client.user) {
      return { success: false, error: 'Client user does not exist' };
    }

    return { success: true, payload: structUser(client.user) };
  });

  ipcMain.handle('setClientStatus', (_, status) => {
    if (!client.user) {
      return { success: false, error: 'Client user does not exist' };
    }

    let newStatus: PresenceUpdateStatus;

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

    return { success: true };
  });
};

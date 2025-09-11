import { DmsIpcSlice } from '.';
import { IpcApiResponse } from '..';
import { DmChannel } from '../../features/channels/types';
import { structDmChannel } from '../../features/channels/utils';
import { structUser } from '../../features/users/utils';
import { createIpcMain } from '../../utils/createIpcMain';
import { client } from '../client/utils';

const ipcMain = createIpcMain<DmsIpcSlice>();

export const handleIpcMainEvents = () => {
  ipcMain.handle('getCachedUsers', async () => {
    return client.users.cache.map((user) => structUser(user)).filter((user) => user.id !== client.user?.id);
  });

  ipcMain.handle('getDmChannel', async (_, userId) => {
    try {
      const user = await client.users.fetch(userId);

      if (!user) {
        throw Error('User does not exist');
      }

      let channel = user.dmChannel;

      if (!user.dmChannel) {
        channel = await user.createDM();
      }

      return { success: true, payload: structDmChannel(channel!)! } as IpcApiResponse<DmChannel>;
    } catch (err: any) {
      return { success: false, error: err.members } as IpcApiResponse<DmChannel>;
    }
  });
};

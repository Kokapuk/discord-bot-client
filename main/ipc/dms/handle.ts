import { structDmChannel } from '@main/features/channels/utils';
import { createIpcMain } from '@main/utils/createIpcMain';
import { DmsIpcSlice } from '.';
import { client } from '../client/utils';
import { IpcApiResponse } from '..';
import { DmChannel } from '@main/features/channels/types';

const ipcMain = createIpcMain<DmsIpcSlice>();

export const handleIpcMainEvents = () => {
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

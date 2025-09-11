import { DmChannel } from '@main/features/channels/types';
import { User } from '@main/features/users/types';
import { IpcApiResponse } from '..';
import { CreateIpcSlice } from '../../utils/ipc';

export type DmsIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    getCachedUsers: () => Promise<User[]>;
    getDmChannel: (userId: string) => Promise<IpcApiResponse<DmChannel>>;
  };
}>;

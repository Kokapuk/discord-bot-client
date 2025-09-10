import { DmChannel } from '@main/features/channels/types';
import { IpcApiResponse } from '..';
import { CreateIpcSlice } from '../../utils/ipc';

export type DmsIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    getDmChannel: (userId: string) => Promise<IpcApiResponse<DmChannel>>;
  };
}>;

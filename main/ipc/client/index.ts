import { Status, User } from '@main/features/users/types';
import { IpcApiResponse } from '..';
import { CreateIpcSlice } from '../../utils/ipc';

export type ClientIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    login: (token: string) => Promise<IpcApiResponse>;
    getClientUser: () => Promise<IpcApiResponse<User>>;
    setClientStatus: (status: Exclude<Status, 'offline'>) => Promise<IpcApiResponse>;
  };
}>;

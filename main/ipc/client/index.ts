import { IpcApiResponse } from '..';
import { CreateIpcSlice } from '../../utils/ipc';
import { Status, User } from './types';

export type ClientIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    login: (token: string) => Promise<IpcApiResponse>;
    getClientUser: () => Promise<IpcApiResponse<User>>;
    setClientStatus: (status: Exclude<Status, 'offline'>) => Promise<IpcApiResponse>;
  };
}>;

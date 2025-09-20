import { CreateIpcSlice } from '../../utils/ipc';

export type AppIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    getAppVersion: () => Promise<string>;
    getNodeVersion: () => Promise<string>;
    getElectronVersion: () => Promise<string>;
    getChromeVersion: () => Promise<string>;
  };
}>;

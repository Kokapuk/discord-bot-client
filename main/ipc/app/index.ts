import { CreateIpcSlice } from '../../utils/ipc';

export type AppIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    setTheme: (theme: 'light' | 'dark') => Promise<void>;
  };
}>;

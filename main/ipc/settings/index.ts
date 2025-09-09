import { CreateIpcSlice } from '@main/utils/ipc';
import { Settings } from '@main/utils/settingsStore';

export type SettingsIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    getTheme: () => Promise<Settings['theme']>;
    setTheme: (theme: Settings['theme']) => Promise<void>;
  };
  mainToRenderer: {
    themeUpdate: (newTheme: Settings['theme'], oldTheme: Settings['theme']) => void;
  };
}>;

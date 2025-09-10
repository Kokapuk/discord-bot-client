import { CreateIpcSlice } from '@main/utils/ipc';
import { Settings } from '@main/utils/settingsStore';

export type SettingsIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    getTheme: () => Promise<Settings['theme']>;
    setTheme: (theme: Settings['theme']) => Promise<void>;
    getAccentColor: () => Promise<Settings['accentColor']>;
    setAccentColor: (theme: Settings['accentColor']) => Promise<void>;
  };
  mainToRenderer: {
    themeUpdate: (newTheme: Settings['theme'], oldTheme: Settings['theme']) => void;
    accentColorUpdate: (newColor: Settings['accentColor'], oldColor: Settings['accentColor']) => void;
  };
}>;

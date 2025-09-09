import { nativeTheme, WebContents } from 'electron';
import { SettingsIpcSlice } from '.';
import { createIpcMain } from '../../utils/createIpcMain';
import settingsStore from '../../utils/settingsStore';

export const ipcMain = createIpcMain<SettingsIpcSlice>();

export const handleIpcMainEvents = () => {
  ipcMain.handle('getTheme', () => settingsStore.get('theme'));

  ipcMain.handle('setTheme', (_, theme) => {
    nativeTheme.themeSource = theme;
    settingsStore.set('theme', theme);
  });
};

export const handleIpcMainAutoInvokeEvents = (webContents: WebContents) => {
  settingsStore.onDidChange('theme', (newValue, oldValue) =>
    ipcMain.send(webContents, 'themeUpdate', newValue!, oldValue!)
  );
};

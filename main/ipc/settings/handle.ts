import { nativeTheme, WebContents } from 'electron';
import { SettingsIpcSlice } from '.';
import { createIpcMain } from '../../utils/createIpcMain';
import settingsStore from '../../utils/settingsStore';

export const ipcMain = createIpcMain<SettingsIpcSlice>();

export const handleIpcMainEvents = () => {
  ipcMain.handle('getTheme', async () => settingsStore.get('theme'));

  ipcMain.handle('setTheme', async (_, theme) => {
    nativeTheme.themeSource = theme;
    settingsStore.set('theme', theme);
  });

  ipcMain.handle('getAccentColor', async () => settingsStore.get('accentColor'));
  ipcMain.handle('setAccentColor', async (_, accentColor) => settingsStore.set('accentColor', accentColor));

  ipcMain.handle('getAudioEffectsVolume', async () => settingsStore.get('audioEffectsVolume'));
  ipcMain.handle('setAudioEffectsVolume', async (_, audioEffectsVolume) =>
    settingsStore.set('audioEffectsVolume', audioEffectsVolume)
  );
};

export const handleIpcMainAutoInvokeEvents = (webContents: WebContents) => {
  const unsubscribeThemeUpdate = settingsStore.onDidChange('theme', (newTheme, oldTheme) =>
    ipcMain.send(webContents, 'themeUpdate', newTheme!, oldTheme!)
  );

  const unsubscribeAccentColorUpdate = settingsStore.onDidChange('accentColor', (newColor, oldColor) =>
    ipcMain.send(webContents, 'accentColorUpdate', newColor!, oldColor!)
  );

  const unsubscribeAudioEffectsVolumeUpdate = settingsStore.onDidChange('audioEffectsVolume', (newVolume, oldVolume) =>
    ipcMain.send(webContents, 'audioEffectsVolumeUpdate', newVolume!, oldVolume!)
  );

  return () => {
    unsubscribeThemeUpdate();
    unsubscribeAccentColorUpdate();
    unsubscribeAudioEffectsVolumeUpdate();
  };
};

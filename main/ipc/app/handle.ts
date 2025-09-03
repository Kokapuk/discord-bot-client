import { createIpcMain } from '../../utils/createIpcMain';
import { nativeTheme } from 'electron';
import { AppIpcSlice } from '.';

const ipcMain = createIpcMain<AppIpcSlice>();

export const handleIpcMainEvents = () => {
  ipcMain.handle('setTheme', (_, theme) => {
    nativeTheme.themeSource = theme;
  });
};

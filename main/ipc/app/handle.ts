import { app } from 'electron';
import { AppIpcSlice } from '.';
import { createIpcMain } from '../../utils/createIpcMain';

const ipcMain = createIpcMain<AppIpcSlice>();

export const handleIpcMainEvents = () => {
  ipcMain.handle('getAppVersion', async () => app.getVersion());
  ipcMain.handle('getNodeVersion', async () => process.versions.node);
  ipcMain.handle('getElectronVersion', async () => process.versions.electron);
  ipcMain.handle('getChromeVersion', async () => process.versions.chrome);
};

import { IpcMainInvokeEvent, nativeTheme } from 'electron';

export const setTheme = (_: IpcMainInvokeEvent | undefined, theme: 'light' | 'dark') => {
  nativeTheme.themeSource = theme;
};

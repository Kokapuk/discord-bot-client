import { BrowserWindow, nativeTheme } from 'electron';

const handleThemeUpdate = (window: BrowserWindow, titleBarHeight: number) => {
  const themeUpdated = () => {
    window.setTitleBarOverlay({
      color: nativeTheme.shouldUseDarkColors ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
      symbolColor: nativeTheme.shouldUseDarkColors ? 'white' : 'black',
      height: titleBarHeight,
    });

    window.setBackgroundMaterial(nativeTheme.shouldUseDarkColors ? 'mica' : 'tabbed')
  };

  nativeTheme.on('updated', themeUpdated);
  themeUpdated();

  window.on('close', () => nativeTheme.off('updated', themeUpdated));
};

export default handleThemeUpdate;

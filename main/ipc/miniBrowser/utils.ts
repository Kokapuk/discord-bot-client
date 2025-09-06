import { WebContents } from 'electron';

export const structNavigationData = (webContents: WebContents) => ({
  url: webContents.getURL(),
  canGoBack: webContents.navigationHistory.canGoBack(),
  canGoForward: webContents.navigationHistory.canGoForward(),
});

export const isStringUrl = (url: string) => {
  return /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/.test(
    url
  );
};

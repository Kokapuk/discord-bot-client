import { CreateIpcSlice } from '@main/utils/ipc';

export interface NavigationData {
  url: string;
  canGoBack: boolean;
  canGoForward: boolean;
}

export type MiniBrowserIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    getInitialNavigationData: () => Promise<NavigationData>;
    loadUrl: (url: string) => Promise<void>;
    goBack: () => Promise<void>;
    goForward: () => Promise<void>;
    reload: () => Promise<void>;
  };
  mainToRenderer: {
    navigate: (data: NavigationData) => void;
  };
}>;

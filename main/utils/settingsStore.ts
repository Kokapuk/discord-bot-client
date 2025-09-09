import Store from 'electron-store';

export interface Settings {
  theme: 'light' | 'dark';
}

const settingsStore = new Store<Settings>({
  defaults: {
    theme: 'dark',
  },
});

export default settingsStore;

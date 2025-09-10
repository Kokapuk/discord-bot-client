import Store from 'electron-store';

export interface Settings {
  theme: 'light' | 'dark';
  accentColor: 'gray' | 'red' | 'pink' | 'purple' | 'cyan' | 'blue' | 'teal' | 'green' | 'yellow' | 'orange';
}

const settingsStore = new Store<Settings>({
  defaults: {
    theme: 'dark',
    accentColor: 'blue',
  },
});

export default settingsStore;

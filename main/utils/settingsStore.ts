import Store from 'electron-store';

export interface Settings {
  theme: 'light' | 'dark';
  accentColor: 'gray' | 'red' | 'pink' | 'purple' | 'cyan' | 'blue' | 'teal' | 'green' | 'yellow' | 'orange';
  audioEffectsVolume: number;
}

const settingsStore = new Store<Settings>({
  defaults: {
    theme: 'dark',
    accentColor: 'blue',
    audioEffectsVolume: 0.3,
  },
});

export default settingsStore;

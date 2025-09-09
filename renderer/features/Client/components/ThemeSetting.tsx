import { RadioGroup, Stack } from '@chakra-ui/react';
import { Settings } from '@main/utils/settingsStore';
import { useEffect, useState } from 'react';
import Setting, { SettingProps } from './Setting';

const THEME_SETTING_OPTIONS = { light: 'Light', dark: 'Dark' } as const satisfies Record<Settings['theme'], string>;

export default function ThemeSetting(props: Partial<SettingProps>) {
  const [theme, setTheme] = useState<Settings['theme']>('light');

  useEffect(() => {
    (async () => {
      setTheme(await window.ipcRenderer.invoke('getTheme'));
    })();

    const unsubscribe = window.ipcRenderer.on('themeUpdate', (_, theme) => setTheme(theme));

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Setting title="Theme" {...props}>
      <RadioGroup.Root
        defaultValue="1"
        value={theme}
        onValueChange={(e) => window.ipcRenderer.invoke('setTheme', e.value as Settings['theme'])}
      >
        <Stack gap="6" direction="row">
          {Object.entries(THEME_SETTING_OPTIONS).map(([value, label]) => (
            <RadioGroup.Item key={value} value={value}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{label}</RadioGroup.ItemText>
            </RadioGroup.Item>
          ))}
        </Stack>
      </RadioGroup.Root>
    </Setting>
  );
}

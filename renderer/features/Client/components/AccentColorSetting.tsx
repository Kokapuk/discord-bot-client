import { RadioGroup, Stack } from '@chakra-ui/react';
import { Settings } from '@main/utils/settingsStore';
import { useEffect, useState } from 'react';
import Setting, { SettingProps } from './Setting';

const ACCENT_COLOR_SETTING_OPTIONS = {
  gray: 'Gray',
  red: 'Red',
  pink: 'Pink',
  purple: 'Purple',
  cyan: 'Cyan',
  blue: 'Blue',
  teal: 'Teal',
  green: 'Green',
  yellow: 'Yellow',
  orange: 'Orange',
} as const satisfies Record<Settings['accentColor'], string>;

export default function AccentColorSetting(props: Partial<SettingProps>) {
  const [accentColor, setAccentColor] = useState<Settings['accentColor']>('blue');

  useEffect(() => {
    (async () => {
      setAccentColor(await window.ipcRenderer.invoke('getAccentColor'));
    })();

    const unsubscribe = window.ipcRenderer.on('accentColorUpdate', (_, color) => setAccentColor(color));

    return unsubscribe;
  }, []);

  return (
    <Setting title="Accent color" {...props}>
      <RadioGroup.Root
        defaultValue="1"
        value={accentColor}
        onValueChange={(e) => window.ipcRenderer.invoke('setAccentColor', e.value as Settings['accentColor'])}
        variant="subtle"
      >
        <Stack gap="6" direction="row" flexWrap="wrap">
          {Object.entries(ACCENT_COLOR_SETTING_OPTIONS).map(([value, label]) => (
            <RadioGroup.Item key={value} value={value} colorPalette={value}>
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

import { Menu } from '@chakra-ui/react';
import { ReactNode, RefAttributes } from 'react';

const AUDIO_TOGGLE_SETTINGS = {
  autoGainControl: 'Auto gain control',
  echoCancellation: 'Echo cancellation',
  noiseSuppression: 'Noise suppression',
} as const satisfies Partial<Record<keyof MediaTrackConstraints, string>>;

export type AudioToggleSettings = Record<keyof typeof AUDIO_TOGGLE_SETTINGS, boolean>;

export type AudioToggleSettingsMenuBaseProps = {
  children: ReactNode;
  settings: AudioToggleSettings;
  onCheckedChange(setting: keyof AudioToggleSettings, checked: boolean): void;
};
export type AudioToggleSettingsMenuProps = AudioToggleSettingsMenuBaseProps &
  Menu.RootProps &
  RefAttributes<HTMLDivElement>;

export default function AudioToggleSettingsMenu({
  children,
  settings,
  onCheckedChange,
  ...props
}: AudioToggleSettingsMenuProps) {
  return (
    <Menu.Root closeOnSelect={false} unmountOnExit {...props}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.ItemGroup>
            {Object.entries(AUDIO_TOGGLE_SETTINGS).map(([value, label]) => (
              <Menu.CheckboxItem
                key={value}
                value={value}
                checked={settings[value as keyof AudioToggleSettings]}
                onCheckedChange={(checked) => onCheckedChange(value as keyof AudioToggleSettings, checked)}
              >
                {label}
                <Menu.ItemIndicator />
              </Menu.CheckboxItem>
            ))}
          </Menu.ItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}

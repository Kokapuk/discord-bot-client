import { ButtonProps, IconButton, Menu } from '@chakra-ui/react';
import { RefAttributes } from 'react';
import { FaGear } from 'react-icons/fa6';

const AUDIO_OUTPUT_TOGGLE_SETTINGS = {
  autoGainControl: 'Auto gain control',
  echoCancellation: 'Echo cancellation',
  noiseSuppression: 'Noise suppression',
} as const satisfies Partial<Record<keyof MediaTrackConstraints, string>>;

export type AudioOutputToggleSettings = Record<keyof typeof AUDIO_OUTPUT_TOGGLE_SETTINGS, boolean>;

export type AudioOutputToggleSettingsMenuProps = {
  settings: AudioOutputToggleSettings;
  onCheckedChange(setting: keyof AudioOutputToggleSettings, checked: boolean): void;
} & ButtonProps;

export default function AudioOutputToggleSettingsMenu({
  settings,
  onCheckedChange,
  ...props
}: AudioOutputToggleSettingsMenuProps & RefAttributes<HTMLButtonElement>) {
  return (
    <Menu.Root closeOnSelect={false}>
      <Menu.Trigger asChild>
        <IconButton variant="surface" {...props}>
          <FaGear />
        </IconButton>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.ItemGroup>
            {Object.entries(AUDIO_OUTPUT_TOGGLE_SETTINGS).map(([value, label]) => (
              <Menu.CheckboxItem
                key={value}
                value={value}
                checked={settings[value as keyof AudioOutputToggleSettings]}
                onCheckedChange={(checked) => onCheckedChange(value as keyof AudioOutputToggleSettings, checked)}
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

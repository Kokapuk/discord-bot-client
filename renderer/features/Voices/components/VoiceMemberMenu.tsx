import { Menu, Portal, Stack, Text } from '@chakra-ui/react';
import { VoiceMember } from '@main/features/voice/types';
import { Slider } from '@renderer/ui/slider';
import { ReactNode, useEffect, useState } from 'react';

export type VoiceMemberMenuBaseProps = { member: VoiceMember; children: ReactNode };
export type VoiceMemberMenuProps = VoiceMemberMenuBaseProps & Menu.RootProps;

export default function VoiceMemberMenu({ member, children, ...props }: VoiceMemberMenuProps) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    (async () => {
      setVolume(await window.ipcRenderer.invoke('getUserVolume', member.id));
    })();
  }, [isMenuOpen]);

  return (
    <Menu.Root unmountOnExit onOpenChange={(e) => setMenuOpen(e.open)} {...props}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Slider
              min={0}
              max={2}
              step={0.01}
              value={[volume]}
              onValueChange={(e) => setVolume(e.value[0])}
              onValueChangeEnd={(e) => window.ipcRenderer.invoke('setUserVolume', member.id, e.value[0])}
              size="sm"
              label={
                <Stack direction="row" justifyContent="space-between">
                  <Text as="label">
                    Volume
                  </Text>
                  <Text fontWeight="400">{Math.floor(volume * 100)}%</Text>
                </Stack>
              }
            />
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

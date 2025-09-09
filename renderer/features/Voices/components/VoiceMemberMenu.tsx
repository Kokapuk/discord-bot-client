import { Menu, Portal, Slider, Stack } from '@chakra-ui/react';
import { VoiceMember } from '@main/ipc/voice/types';
import { ReactNode, useEffect, useState } from 'react';

export type VoiceMemberMenuProps = { member: VoiceMember; children: ReactNode };

export default function VoiceMemberMenu({ member, children }: VoiceMemberMenuProps) {
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
    <Menu.Root unmountOnExit onOpenChange={(e) => setMenuOpen(e.open)}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Slider.Root
              min={0}
              max={2}
              step={0.01}
              value={[volume]}
              onValueChange={(e) => setVolume(e.value[0])}
              onValueChangeEnd={(e) => window.ipcRenderer.invoke('setUserVolume', member.id, e.value[0])}
              size="sm"
            >
              <Stack direction="row" justifyContent="space-between">
                <Slider.Label>Volume</Slider.Label>
                <Slider.ValueText>{Math.floor(volume * 100)}%</Slider.ValueText>
              </Stack>
              <Slider.Control>
                <Slider.Track>
                  <Slider.Range />
                </Slider.Track>
                <Slider.Thumbs />
              </Slider.Control>
            </Slider.Root>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

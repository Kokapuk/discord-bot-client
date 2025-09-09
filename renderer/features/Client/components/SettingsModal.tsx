import { CloseButton, Dialog, Portal, Stack } from '@chakra-ui/react';
import { Tooltip } from '@renderer/ui/Tooltip';
import { ReactNode, RefAttributes } from 'react';
import ThemeSetting from './ThemeSetting';

export type SettingsModalBaseProps = { children: ReactNode; triggerTooltip?: string };
export type SettingsModalProps = SettingsModalBaseProps & Dialog.RootProps & RefAttributes<HTMLDivElement>;

export default function SettingsModal({ children, triggerTooltip, ...props }: SettingsModalProps) {
  let trigger = <Dialog.Trigger asChild>{children}</Dialog.Trigger>;

  if (triggerTooltip) {
    trigger = <Tooltip content={triggerTooltip}>{trigger}</Tooltip>;
  }

  return (
    <Dialog.Root unmountOnExit placement="center" {...props}>
      {trigger}
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Settings</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="5">
                <ThemeSetting />
              </Stack>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

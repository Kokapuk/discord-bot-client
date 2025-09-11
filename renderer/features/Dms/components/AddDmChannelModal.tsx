import { CloseButton, Dialog, Portal, Stack } from '@chakra-ui/react';
import { User } from '@main/features/users/types';
import { Tooltip, TooltipProps } from '@renderer/ui/Tooltip';
import UserButton from '@renderer/ui/UserButton';
import { ReactNode, RefAttributes, useEffect, useState } from 'react';
import useDmsStore from '../store';

export type AddDmChannelModalBaseProps = {
  children: ReactNode;
  triggerTooltipProps?: TooltipProps & RefAttributes<HTMLDivElement>;
};
export type AddDmChannelModalProps = AddDmChannelModalBaseProps & Dialog.RootProps & RefAttributes<HTMLDivElement>;

export default function AddDmChannelModal({ children, triggerTooltipProps, ...props }: AddDmChannelModalProps) {
  const [isOpen, setOpen] = useState(props.open ?? false);
  const [cachedUsers, setCachedUsers] = useState<User[] | null>(null);
  const pullChannel = useDmsStore((s) => s.pullChannel);

  useEffect(() => {
    if (isOpen) {
      (async () => {
        setCachedUsers(await window.ipcRenderer.invoke('getCachedUsers'));
      })();
    }
  }, [isOpen]);

  const handleUserClick = async (user: User) => {
    await pullChannel(user.id);
  };

  return (
    <Dialog.Root placement="center" onOpenChange={(e) => setOpen(e.open)} {...props}>
      <Tooltip content="" disabled={!triggerTooltipProps?.content} {...triggerTooltipProps}>
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      </Tooltip>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Add DM channel</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body maxHeight="70vh" overflow="auto">
              <Stack>
                {cachedUsers?.map((user) => (
                  <UserButton key={user.id} user={user} onClick={() => handleUserClick(user)} />
                ))}
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

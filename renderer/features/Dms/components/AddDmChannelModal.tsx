import { CloseButton, Dialog, Input, InputGroup, Portal, Stack } from '@chakra-ui/react';
import { User } from '@main/features/users/types';
import { Tooltip, TooltipProps } from '@renderer/ui/Tooltip';
import UserButton from '@renderer/ui/UserButton';
import debounce from 'lodash/debounce';
import { ReactNode, RefAttributes, useEffect, useMemo, useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import useDmsStore from '../store';

export type AddDmChannelModalBaseProps = {
  children: ReactNode;
  triggerTooltipProps?: TooltipProps & RefAttributes<HTMLDivElement>;
};
export type AddDmChannelModalProps = AddDmChannelModalBaseProps & Dialog.RootProps & RefAttributes<HTMLDivElement>;

export default function AddDmChannelModal({ children, triggerTooltipProps, ...props }: AddDmChannelModalProps) {
  const [isOpen, setOpen] = useState(props.open ?? false);
  const [cachedUsers, setCachedUsers] = useState<User[] | null>(null);
  const { channels, pullChannel } = useDmsStore(
    useShallow((s) => ({ channels: s.channels, pullChannel: s.pullChannel }))
  );
  const [query, setQuery] = useState('');
  const filteredUsers = useMemo(
    () =>
      cachedUsers?.filter(
        (user) =>
          !Object.keys(channels).includes(user.id) &&
          (user.displayName.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase()))
      ),
    [cachedUsers, channels, query]
  );

  useEffect(() => {
    if (isOpen) {
      (async () => {
        setCachedUsers(await window.ipcRenderer.invoke('getCachedUsers'));
        setQuery('');
      })();
    }
  }, [isOpen]);

  const updateQuery = useMemo(() => debounce((query) => setQuery(query), 250), []);

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
              <Stack width="100%">
                <Dialog.Title>Add DM channel</Dialog.Title>
                <InputGroup startElement={<FaMagnifyingGlass />}>
                  <Input placeholder="Search" autoFocus onChange={(e) => updateQuery(e.currentTarget.value)} />
                </InputGroup>
              </Stack>
            </Dialog.Header>
            <Dialog.Body maxHeight="70vh" overflow="auto">
              <Stack>
                {filteredUsers?.map((user) => (
                  <UserButton key={user.id} user={user} hideStatus onClick={() => handleUserClick(user)} />
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

import { Button, Menu, MenuRootProps, MenuTriggerProps, Portal, Text } from '@chakra-ui/react';
import { Status as StatusType } from '@main/ipc/client/types';
import useAppStore from '@renderer/stores/app';
import { RefAttributes } from 'react';
import { useShallow } from 'zustand/shallow';
import AvatarWithStatus from './AvatarWithStatus';
import Status from './Status';

const STATUSES = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  invisible: 'Invisible',
} as const satisfies Record<Exclude<StatusType, 'offline'>, string>;

export type PickStatusMenuProps = { triggerProps?: Omit<MenuTriggerProps, 'children'> } & Omit<
  MenuRootProps,
  'children'
>;

export default function PickStatusMenu({
  triggerProps,
  ...props
}: PickStatusMenuProps & RefAttributes<HTMLDivElement>) {
  const { client, pullClient } = useAppStore(
    useShallow((s) => ({ client: s.clientUser, pullClient: s.pullClientUser }))
  );

  if (!client) {
    return null;
  }

  const setStatus = (status: Exclude<StatusType, 'offline'>) => {
    window.ipcRenderer.invoke('setClientStatus', status);
    pullClient();
  };

  return (
    <Menu.Root {...props}>
      <Menu.Trigger asChild {...triggerProps}>
        <Button variant="ghost" justifyContent="flex-start" padding="0">
          <AvatarWithStatus src={client.displayAvatarUrl} status={client.status} />
          <Text fontSize="md" fontWeight="600">
            {client.displayName}
          </Text>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.RadioItemGroup
              value={client.status}
              onValueChange={(e) => setStatus(e.value as Exclude<StatusType, 'offline'>)}
            >
              <Menu.ItemGroupLabel>Status</Menu.ItemGroupLabel>
              {Object.entries(STATUSES).map(([value, label]) => (
                <Menu.RadioItem key={value} value={value}>
                  <Menu.ItemIndicator />
                  <Status status={value as StatusType} />
                  {label}
                </Menu.RadioItem>
              ))}
            </Menu.RadioItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

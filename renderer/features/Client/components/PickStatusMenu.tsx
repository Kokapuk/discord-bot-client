import { Menu, Portal } from '@chakra-ui/react';
import { Status as StatusType } from '@main/ipc/client/types';
import Status from '@renderer/ui/Status';
import { ReactNode, RefAttributes } from 'react';
import { useShallow } from 'zustand/shallow';
import useClientStore from '../store';

const STATUSES = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  invisible: 'Invisible',
} as const satisfies Record<Exclude<StatusType, 'offline'>, string>;

export type PickStatusMenuBaseProps = { children: ReactNode };
export type PickStatusMenuProps = PickStatusMenuBaseProps & Menu.RootProps & RefAttributes<HTMLDivElement>;

export default function PickStatusMenu({ children, ...props }: PickStatusMenuProps) {
  const { clientUser, pullClientUser } = useClientStore(
    useShallow((s) => ({ clientUser: s.clientUser, pullClientUser: s.pullClientUser }))
  );

  if (!clientUser) {
    return null;
  }

  const setStatus = (status: Exclude<StatusType, 'offline'>) => {
    window.ipcRenderer.invoke('setClientStatus', status);
    pullClientUser();
  };

  return (
    <Menu.Root unmountOnExit {...props}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.RadioItemGroup
              value={clientUser.status}
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

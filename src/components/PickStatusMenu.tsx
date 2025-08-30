import { Menu, MenuRootProps, Portal } from '@chakra-ui/react';
import { Status as StatusType } from '@main/api/discord/types';
import { ReactNode, RefAttributes } from 'react';
import Status from './Status';

const STATUSES = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  invisible: 'Invisible',
} as const satisfies Partial<Record<StatusType, string>>;

export type PickStatusMenuProps = { children: ReactNode } & Omit<MenuRootProps, 'children'>;

export default function PickStatusMenu({ children, ...props }: PickStatusMenuProps & RefAttributes<HTMLDivElement>) {
  return (
    <Menu.Root {...props}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>Status</Menu.ItemGroupLabel>
              {Object.entries(STATUSES).map(([value, label]) => (
                <Menu.Item key={value} value={value}>
                  <Status status={value as StatusType} /> {label}
                </Menu.Item>
              ))}
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

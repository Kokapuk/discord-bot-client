import { Input, Menu, Portal } from '@chakra-ui/react';
import Avatar from '@renderer/ui/Avatar';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useTextareaContext } from '../context';

export type MentionMenuProps = { textarea: RefObject<HTMLTextAreaElement | null> };

export default function MentionMenu({ textarea }: MentionMenuProps) {
  const [open, setOpen] = useState(false);
  const getAnchorRect = () => textarea.current!.getBoundingClientRect();
  const { users, roles } = useTextareaContext();
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(
    () =>
      users?.filter(
        (user) =>
          user.displayName.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
          user.username.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      ),
    [users, query]
  );

  const filteredRoles = useMemo(
    () => roles?.filter((role) => role.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())),
    [roles, query]
  );

  const savedCursorPos = useRef<number>(0);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      textarea.current?.focus();
      textarea.current?.setSelectionRange(savedCursorPos.current, savedCursorPos.current);
    }
  };

  useEffect(() => {
    if (!textarea.current) {
      return;
    }

    const textareaElement = textarea.current;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === '@') {
        savedCursorPos.current = textareaElement.selectionStart + 1;
        setOpen(true);
      }
    };

    textareaElement.addEventListener('keydown', handleKeydown);

    return () => {
      textareaElement.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const handleSelect = (value: string) => {
    if (!textarea.current) {
      return;
    }

    textarea.current.value = `${textarea.current.value.slice(
      0,
      savedCursorPos.current - 1
    )}${value} ${textarea.current.value.slice(savedCursorPos.current)}`;

    savedCursorPos.current += value.length + 1;
  };

  return (
    <Menu.Root
      positioning={{ getAnchorRect }}
      unmountOnExit
      open={open}
      onOpenChange={(e) => handleOpenChange(e.open)}
      onExitComplete={() => setQuery('')}
      onSelect={(e) => handleSelect(e.value)}
    >
      <Portal>
        <Menu.Positioner>
          <Menu.Content maxHeight="80">
            <Input
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              position="sticky"
              top="0"
              zIndex="1"
              backgroundColor="bg"
            />

            {filteredUsers?.map((user) => (
              <Menu.Item key={user.id} value={`<@${user.id}>`}>
                <Avatar src={user.displayAvatarUrl} size="6" />
                {user.displayName}
              </Menu.Item>
            ))}

            <Menu.Item value="@everyone">everyone</Menu.Item>
            <Menu.Item value="@here">here</Menu.Item>

            {filteredRoles?.map((role) => (
              <Menu.Item key={role.id} value={`<@&${role.id}>`}>
                {role.name}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

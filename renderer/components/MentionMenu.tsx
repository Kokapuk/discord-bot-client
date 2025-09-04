import { Menu, Portal } from '@chakra-ui/react';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { useTextareaContext } from '../providers/TextareaContext';
import Avatar from './Avatar';

export type MentionMenuProps = { textarea: RefObject<HTMLTextAreaElement | null> };

export default function MentionMenu({ textarea }: MentionMenuProps) {
  const [open, setOpen] = useState(false);
  const getAnchorRect = () => textarea.current!.getBoundingClientRect();
  const { users, roles } = useTextareaContext();
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

  const handleKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
      return;
    }

    const isKeyPrintableChar = event.key.match(/^.$/);

    if (textarea.current && isKeyPrintableChar) {
      textarea.current.value += event.key;
    }

    if (isKeyPrintableChar) {
      savedCursorPos.current += 1;
    }

    handleOpenChange(false);
  };

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
      open={open}
      onOpenChange={(e) => handleOpenChange(e.open)}
      onSelect={(e) => handleSelect(e.value)}
    >
      <Portal>
        <Menu.Positioner>
          <Menu.Content maxHeight="80" onKeyDown={handleKeydown}>
            {users?.map((user) => (
              <Menu.Item key={user.id} value={`<@${user.id}>`}>
                <Avatar src={user.displayAvatarUrl} size="6" />
                {user.displayName}
              </Menu.Item>
            ))}
            <Menu.Item value="@everyone">everyone</Menu.Item>
            <Menu.Item value="@here">here</Menu.Item>
            {roles?.map((role) => (
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

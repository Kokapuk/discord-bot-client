import { Group, GroupProps, IconButton, Text } from '@chakra-ui/react';
import { ReactNode, RefAttributes } from 'react';
import { FaX } from 'react-icons/fa6';

export type TextareaActionContextProps = { label: ReactNode; onCancel?(): void } & GroupProps &
  RefAttributes<HTMLDivElement>;

export default function TextareaActionContext({ label, onCancel, ...props }: TextareaActionContextProps) {
  return (
    <Group
      backgroundColor="gray.800"
      borderRadius="md"
      justifyContent="space-between"
      alignItems="center"
      paddingLeft="4"
      width="100%"
      attached
      {...props}
    >
      <Text fontSize="sm">{label}</Text>
      <IconButton aria-label="Cancel" onClick={onCancel} variant="ghost" size="xs">
        <FaX />
      </IconButton>
    </Group>
  );
}

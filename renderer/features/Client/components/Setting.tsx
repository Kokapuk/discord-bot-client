import { Heading, Stack, StackProps } from '@chakra-ui/react';
import { ReactNode, RefAttributes } from 'react';

export type SettingProps = { title: ReactNode; children: ReactNode } & Omit<StackProps, 'title' | 'children'>;

export default function Setting({ title, children, ...props }: SettingProps & RefAttributes<HTMLDivElement>) {
  return (
    <Stack {...props}>
      <Heading as="h2" size="md">
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

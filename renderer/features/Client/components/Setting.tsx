import { Heading, Stack, StackProps } from '@chakra-ui/react';
import { ReactNode, RefAttributes } from 'react';

export type SettingBaseProps = { title: ReactNode; children: ReactNode } & Omit<StackProps, 'title' | 'children'>;
export type SettingProps = SettingBaseProps & Omit<StackProps, 'title' | 'children'> & RefAttributes<HTMLDivElement>;

export default function Setting({ title, children, ...props }: SettingProps) {
  return (
    <Stack {...props}>
      <Heading as="h2" size="md">
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

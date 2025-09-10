import { Stack, StackProps } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { RefAttributes } from 'react';

export type TimeSeparatorBaseProps = { timestamp: number; format?: string };
export type TimeSeparatorProps = TimeSeparatorBaseProps & StackProps & RefAttributes<HTMLDivElement>;

export default function TimeSeparator({ timestamp, format = 'DD MMMM YYYY', ...props }: TimeSeparatorProps) {
  return (
    <Stack
      direction="row"
      flexShrink="0"
      position="relative"
      whiteSpace="nowrap"
      alignItems="center"
      fontSize="xs"
      fontWeight="600"
      color="fg.muted"
      _before={{ content: '""', width: '100%', height: '1px', backgroundColor: 'bg.inverted/15' }}
      _after={{ content: '""', width: '100%', height: '1px', backgroundColor: 'bg.inverted/15' }}
      {...props}
    >
      {dayjs(timestamp).format(format)}
    </Stack>
  );
}

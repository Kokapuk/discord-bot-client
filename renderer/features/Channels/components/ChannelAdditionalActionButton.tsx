import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { Tooltip, TooltipProps } from '@renderer/ui/Tooltip';

export type ChannelAdditionalActionButtonProps = { tooltipProps?: TooltipProps } & IconButtonProps;

export default function ChannelAdditionalActionButton({ tooltipProps, ...props }: ChannelAdditionalActionButtonProps) {
  return (
    <Tooltip disabled={!tooltipProps?.content} content="" {...tooltipProps}>
      <IconButton size="xs" variant="ghost" {...props} />
    </Tooltip>
  );
}

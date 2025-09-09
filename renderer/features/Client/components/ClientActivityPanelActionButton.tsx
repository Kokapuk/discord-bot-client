import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { Tooltip } from '@renderer/ui/Tooltip';
import { RefAttributes } from 'react';

export type VoiceChannelActionButtonProps = { toggled?: boolean; tooltip?: string };

export default function ClientActivityPanelActionButton({
  toggled,
  tooltip,
  ...props
}: VoiceChannelActionButtonProps & IconButtonProps & RefAttributes<HTMLButtonElement>) {
  const button = <IconButton size="xs" variant={toggled ? 'ghost' : 'subtle'} aria-checked={toggled} {...props} />;

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
}

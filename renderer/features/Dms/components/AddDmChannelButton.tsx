import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';
import { FaPlus } from 'react-icons/fa6';
import AddDmChannelModal from './AddDmChannelModal';

export default function AddDmChannelButton(props: IconButtonProps & RefAttributes<HTMLButtonElement>) {
  return (
    <AddDmChannelModal triggerTooltipProps={{ content: 'Add DM channel', positioning: { placement: 'right' } }}>
      <IconButton variant="subtle" borderRadius="full" {...props}>
        <FaPlus />
      </IconButton>
    </AddDmChannelModal>
  );
}

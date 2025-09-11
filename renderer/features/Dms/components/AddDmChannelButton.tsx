import { IconButton } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa6';
import AddDmChannelModal from './AddDmChannelModal';

export default function AddDmChannelButton() {
  return (
    <AddDmChannelModal triggerTooltipProps={{ content: 'Add DM channel', positioning: { placement: 'right' } }}>
      <IconButton variant="subtle" borderRadius="full">
        <FaPlus />
      </IconButton>
    </AddDmChannelModal>
  );
}

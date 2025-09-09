import useClientStore from '@renderer/features/Client/store';
import { Attachment } from 'discord.js';

export type AudioAttachmentProps = { attachment: Pick<Attachment, 'url'> };

export default function AudioAttachment({ attachment }: AudioAttachmentProps) {
  const setMediaVolume = useClientStore((s) => s.setMediaVolume);

  return (
    <audio
      src={attachment.url}
      preload="none"
      controls
      onPlay={(e) => (e.currentTarget.volume = useClientStore.getState().mediaVolume)}
      onVolumeChange={(e) => setMediaVolume(e.currentTarget.volume)}
    />
  );
}

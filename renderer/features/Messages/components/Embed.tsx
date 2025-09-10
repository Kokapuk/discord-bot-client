import { type Embed } from '@main/features/messages/types';
import ImageAttachment from './ImageAttachment';
import RichEmbed from './RichEmbed';
import VideoAttachment from './VideoAttachment';

export type EmbedProps = { embed: Embed };

export default function Embed({ embed }: EmbedProps) {
  if (embed.type === 'image') {
    return (
      <ImageAttachment
        attachment={{
          height: embed.thumbnail?.height ?? null,
          width: embed.thumbnail?.width ?? null,
          name: 'Embed',
          url: embed.thumbnail!.url,
        }}
      />
    );
  }

  if ((embed.type === 'video' && !embed.provider) || embed.type === 'gifv') {
    return (
      <VideoAttachment
        attachment={{
          height: embed.video!.height ?? null,
          width: embed.video!.width ?? null,
          url: embed.video!.url,
        }}
        gif={embed.type === 'gifv'}
      />
    );
  }

  return <RichEmbed embed={embed} />;
}

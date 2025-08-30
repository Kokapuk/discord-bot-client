import { Avatar, Circle, Float, Image } from '@chakra-ui/react';
import { type Guild } from '@main/api/discord/types';
import Link from '@renderer/ui/Link';
import { Tooltip } from '@renderer/ui/tooltip';

export interface GuildProps {
  guild: Guild;
  unread?: boolean;
}

export default function Guild({ guild, unread }: GuildProps) {
  return (
    <Tooltip content={guild.name} positioning={{ placement: 'right' }}>
      <Link to={`/guilds/${guild.id}`} style={{ position: 'relative' }}>
        {unread && (
          <Float placement="middle-start" zIndex="1">
            <Circle size="2" backgroundColor="colorPalette.fg"></Circle>
          </Float>
        )}
        <Avatar.Root size="xl">
          {!!guild.iconUrl ? (
            <Image loading="lazy" src={guild.iconUrl} position="absolute" inset="0" borderRadius="full" />
          ) : (
            <Avatar.Fallback name={guild.name} />
          )}
        </Avatar.Root>
      </Link>
    </Tooltip>
  );
}

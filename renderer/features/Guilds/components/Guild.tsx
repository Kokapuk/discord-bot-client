import { Avatar, Image } from '@chakra-ui/react';
import { type Guild } from '@main/features/guilds/types';
import Link from '@renderer/ui/Link';
import { Tooltip } from '@renderer/ui/Tooltip';
import UnreadIndicator from '@renderer/ui/UnreadIndicator';
import { RefAttributes } from 'react';

export type GuildBaseProps = { guild: Guild; unread?: boolean };
export type GuildProps = { guild: Guild; unread?: boolean } & Avatar.RootProps & RefAttributes<HTMLDivElement>;

export default function Guild({ guild, unread, ...props }: GuildProps) {
  return (
    <Tooltip content={guild.name} positioning={{ placement: 'right' }}>
      <Link to={`/guilds/${guild.id}`} textDecoration="none" position="relative">
        {unread && <UnreadIndicator />}
        <Avatar.Root size="md" {...props}>
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

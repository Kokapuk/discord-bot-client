import { Avatar, Image } from '@chakra-ui/react';
import { type Guild } from '@main/api/types';
import { Tooltip } from '@renderer/ui/tooltip';
import { NavLink } from 'react-router';

export interface GuildProps {
  guild: Guild;
}

export default function Guild({ guild }: GuildProps) {
  return (
    <Tooltip content={guild.name} positioning={{ placement: 'right' }}>
      <NavLink to={`/guilds/${guild.id}`}>
        <Avatar.Root size="xl">
          {!!guild.iconUrl ? (
            <Image loading="lazy" src={guild.iconUrl} position="absolute" inset="0" borderRadius="full" />
          ) : (
            <Avatar.Fallback name={guild.name} />
          )}
        </Avatar.Root>
      </NavLink>
    </Tooltip>
  );
}

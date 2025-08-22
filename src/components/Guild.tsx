import { Avatar } from '@chakra-ui/react';
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
          <Avatar.Fallback name={guild.name} />
          {!!guild.iconUrl && <Avatar.Image src={guild.iconUrl} />}
        </Avatar.Root>
      </NavLink>
    </Tooltip>
  );
}

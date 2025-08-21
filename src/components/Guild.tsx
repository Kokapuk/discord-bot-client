import { Avatar } from '@chakra-ui/react';
import { NavLink } from 'react-router';
import { type Guild } from '../../electron/api/types';
import { Tooltip } from '../ui/tooltip';

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

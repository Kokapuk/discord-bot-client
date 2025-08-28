import { Avatar, Circle, Float, Image } from '@chakra-ui/react';
import { type Guild } from '@main/api/types';
import { Tooltip } from '@renderer/ui/tooltip';
import { NavLink } from 'react-router';

export interface GuildProps {
  guild: Guild;
  unread?: boolean;
}

export default function Guild({ guild, unread }: GuildProps) {
  return (
    <Tooltip content={guild.name} positioning={{ placement: 'right' }}>
      <NavLink to={`/guilds/${guild.id}`} style={{ position: 'relative' }}>
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
      </NavLink>
    </Tooltip>
  );
}

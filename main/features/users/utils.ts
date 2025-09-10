import { ClientUser, User as DiscordUser } from 'discord.js';
import { User } from './types';

export const structUser = (user: DiscordUser | ClientUser): User => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  displayAvatarUrl: user.displayAvatarURL({ size: 64 }),
  status: (user as ClientUser).presence ? (user as ClientUser).presence.status : undefined,
});

import { Client, ClientUser, User as DiscordUser, GatewayIntentBits } from 'discord.js';
import { User } from './types';

export const client = new Client({
  intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
});

export const logout = async () => {
  await client.destroy();
};

export const structUser = (user: DiscordUser | ClientUser): User => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  displayAvatarUrl: user.displayAvatarURL({ size: 64 }),
  status: (user as ClientUser).presence ? (user as ClientUser).presence.status : undefined,
});

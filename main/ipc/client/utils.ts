import { Client, GatewayIntentBits, Partials } from 'discord.js';

export const client = new Client({
  intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
  partials: [Partials.Channel],
});

export const logout = async () => {
  await client.destroy();
};

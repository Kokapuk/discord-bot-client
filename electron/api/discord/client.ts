import { Client, GatewayIntentBits } from 'discord.js';

export const client = new Client({
  intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
});

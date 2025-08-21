import { ChannelType, Client, GatewayIntentBits } from 'discord.js';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { StripIpcMainInvokeEventArgs } from '../utils';
import { Guild } from './types';

export type IpcApiResponse<T = never> = { success: true; payload?: T } | { success: false; error: string };

const client = new Client({
  intents: Object.values(GatewayIntentBits) as GatewayIntentBits[],
});

const authorize = async (_: IpcMainInvokeEvent, token: string): Promise<IpcApiResponse> => {
  try {
    await client.login(token);
    await new Promise((res) => client.once('ready', res));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

const getAllGuilds = (): IpcApiResponse<Guild[]> => {
  try {
    const guilds: Guild[] = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
      iconUrl: guild.iconURL({ extension: 'webp', size: 64 }),
      channels: guild.channels.cache
        .filter((channel) => channel.type !== ChannelType.GuildCategory)
        .map((channel) => ({ id: channel.id, name: channel.name, type: channel.type })),
    }));

    return { success: true, payload: guilds };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

const ipcMainDiscordApiFunctions = { authorize, getAllGuilds };

export type IpcMainDiscordApiFunctions = StripIpcMainInvokeEventArgs<typeof ipcMainDiscordApiFunctions>;

const bindIpcDiscordApi = () => {
  Object.keys(ipcMainDiscordApiFunctions).map((key) =>
    ipcMain.handle(key, ipcMainDiscordApiFunctions[key as keyof typeof ipcMainDiscordApiFunctions])
  );
};

export default bindIpcDiscordApi;

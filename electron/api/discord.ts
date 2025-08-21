import { Client, ClientEvents, GatewayIntentBits } from 'discord.js';
import { ipcMain, IpcMainInvokeEvent, WebContents } from 'electron';
import { IpcMainEventHandlersToRendererFunctions } from '../utils';
import { Channel, Guild, SupportedChannelType } from './types';

export type IpcApiResponse<T = void> =
  | (T extends void ? { success: true } : { success: true; payload: T })
  | { success: false; error: string };

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

const getGuilds = (): IpcApiResponse<Guild[]> => {
  try {
    const guilds: Guild[] = client.guilds.cache.map((guild) => ({
      id: guild.id,
      name: guild.name,
      iconUrl: guild.iconURL({ extension: 'webp', size: 64 }),
    }));

    return { success: true, payload: guilds };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

const getGuildChannels = (_: IpcMainInvokeEvent, guildId: string): IpcApiResponse<Channel[]> => {
  try {
    const guild = client.guilds.cache.find((guild) => guild.id === guildId);

    if (!guild) {
      return { success: false, error: 'Guild does not exist' };
    }

    const channels: Channel[] = guild.channels.cache
      .filter((channel) => (Object.values(SupportedChannelType) as number[]).includes(channel.type))
      .sort((channelA, channelB) => channelA.type - channelB.type)
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: channel.type as unknown as SupportedChannelType,
      }));

    return { success: true, payload: channels };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

const ipcMainDiscordApiFunctions = { authorize, getGuilds, getGuildChannels };
export type IpcMainDiscordApiFunctions = IpcMainEventHandlersToRendererFunctions<typeof ipcMainDiscordApiFunctions>;

export const bindIpcDiscordApiFunctions = () => {
  Object.keys(ipcMainDiscordApiFunctions).map((key) =>
    ipcMain.handle(key, ipcMainDiscordApiFunctions[key as keyof typeof ipcMainDiscordApiFunctions])
  );
};

const ipcMainDiscordApiEvents = [
  'guildUpdate',
  'channelUpdate',
  'channelCreate',
  'channelDelete',
] as const satisfies readonly (keyof ClientEvents)[];
export type IpcMainDiscordApiEvents = (typeof ipcMainDiscordApiEvents)[number];

export const bindIpcDiscordApiEvents = (webContents: WebContents) => {
  ipcMainDiscordApiEvents.forEach((key) => client.on(key, () => webContents.send(key)));
};

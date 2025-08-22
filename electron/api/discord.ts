import { Client, ClientEvents, GatewayIntentBits } from 'discord.js';
import { ipcMain, IpcMainInvokeEvent, WebContents } from 'electron';
import { IpcMainEventHandlersToRendererFunctions } from '../utils';
import { Channel, Guild, SupportedChannelType, User } from './types';

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

const getGuildMembers = (_: IpcMainInvokeEvent, guildId: string): IpcApiResponse<User[]> => {
  try {
    const guild = client.guilds.cache.find((guild) => guild.id === guildId);

    if (!guild) {
      return { success: false, error: 'Guild does not exist' };
    }

    const priorityStatuses = ['online', 'dnd', 'idle'];
    const members: User[] = guild.members.cache
      .map((member) => ({
        id: member.id,
        displayHexColor: member.displayHexColor === '#000000' ? '#fff' : member.displayHexColor,
        displayName: member.displayName,
        displayAvatarUrl: member.displayAvatarURL({ size: 64 }),
        status: member.presence?.status,
      }))
      .sort((memberA, memberB) => {
        let result = 0;

        if (priorityStatuses.includes(memberA.status as any)) {
          result--;
        }

        if (priorityStatuses.includes(memberB.status as any)) {
          result++;
        }

        return result;
      });

    return { success: true, payload: members };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

const ipcMainDiscordApiFunctions = { authorize, getGuilds, getGuildChannels, getGuildMembers };
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
  'threadUpdate',
  'threadCreate',
  'threadDelete',
  'guildMemberUpdate',
  'guildMemberAdd',
  'guildMemberRemove',
  'presenceUpdate',
] as const satisfies readonly (keyof ClientEvents)[];
export type IpcMainDiscordApiEvents = (typeof ipcMainDiscordApiEvents)[number];

export const bindIpcDiscordApiEvents = (webContents: WebContents) => {
  ipcMainDiscordApiEvents.forEach((key) => client.on(key, () => webContents.send(key)));
};

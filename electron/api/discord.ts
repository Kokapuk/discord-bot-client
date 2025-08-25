import { IpcMainEventHandlersToRendererFunctions } from '@main/utils';
import { AttachmentBuilder, Client, ClientEvents, GatewayIntentBits } from 'discord.js';
import { ipcMain, IpcMainInvokeEvent, WebContents } from 'electron';
import { structChannel, structGuild, structUser, structMessage, structRole } from './struct';
import {
  Channel,
  Guild,
  Message,
  Role,
  SendMessageDTO,
  SupportedChannelType,
  SupportedMessageType,
  User,
} from './types';

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

const getClient = (): IpcApiResponse<User> => {
  if (!client.user) {
    return { success: false, error: 'Client user does not exist' };
  }

  return { success: true, payload: structUser(client.user) };
};

const getGuilds = (): IpcApiResponse<Guild[]> => {
  const guilds: Guild[] = client.guilds.cache.map(structGuild);

  return { success: true, payload: guilds };
};

const getGuildChannels = (_: IpcMainInvokeEvent, guildId: string): IpcApiResponse<Channel[]> => {
  const guild = client.guilds.cache.find((guild) => guild.id === guildId);

  if (!guild) {
    return { success: false, error: 'Guild does not exist' };
  }

  const channels: Channel[] = guild.channels.cache
    .filter((channel) => (Object.values(SupportedChannelType) as number[]).includes(channel.type))
    .sort((channelA, channelB) => channelA.type - channelB.type)
    .map(structChannel);

  return { success: true, payload: channels };
};

const getGuildMembers = (_: IpcMainInvokeEvent, guildId: string): IpcApiResponse<User[]> => {
  const guild = client.guilds.cache.find((guild) => guild.id === guildId);

  if (!guild) {
    return { success: false, error: 'Guild does not exist' };
  }

  const priorityStatuses = ['online', 'dnd', 'idle'];
  const members: User[] = guild.members.cache.map(structUser).sort((memberA, memberB) => {
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
};

const getGuildRoles = (_: IpcMainInvokeEvent, guildId: string): IpcApiResponse<Role[]> => {
  const guild = client.guilds.cache.find((guild) => guild.id === guildId);

  if (!guild) {
    return { success: false, error: 'Guild does not exist' };
  }

  const roles: Role[] = guild.roles.cache.map(structRole);

  return { success: true, payload: roles };
};

const MESSAGES_PER_PAGE = 50;

const fetchChannelsMessages = async (
  _: IpcMainInvokeEvent,
  channelId: string,
  beforeMessageId?: string
): Promise<IpcApiResponse<{ messages: Message[]; topReached: boolean }>> => {
  try {
    const channel = client.channels.cache.find((channel) => channel.id === channelId);

    if (!channel) {
      return { success: false, error: 'Channel does not exist' };
    }

    if (!channel.isTextBased()) {
      return { success: false, error: 'Channel is not text based' };
    }

    const messageCollection = await channel.messages.fetch({
      cache: true,
      limit: MESSAGES_PER_PAGE,
      before: beforeMessageId,
    });
    const messages: Message[] = messageCollection
      .filter((message) => (Object.values(SupportedMessageType) as number[]).includes(message.type))
      .map(structMessage);
    const topReached = messageCollection.size < MESSAGES_PER_PAGE;

    return { success: true, payload: { messages, topReached } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

const sendMessage = async (
  _: IpcMainInvokeEvent,
  channelId: string,
  message: SendMessageDTO
): Promise<IpcApiResponse> => {
  try {
    const channel = client.channels.cache.find((channel) => channel.id === channelId);

    if (!channel) {
      return { success: false, error: 'Channel does not exist' };
    }

    if (!channel.isTextBased()) {
      return { success: false, error: 'Channel is not text based' };
    }

    if (!channel.isSendable()) {
      return { success: false, error: 'Channel is not sendable' };
    }

    if (!message.content && !message.files?.length) {
      return { success: false, error: 'At least one is required: content, files' };
    }

    const files = message.files?.map((file) => new AttachmentBuilder(Buffer.from(file.buffer), { name: file.name }));
    await channel.send({ content: message.content, files });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

const ipcMainDiscordApiFunctions = {
  authorize,
  getClient,
  getGuilds,
  getGuildChannels,
  getGuildMembers,
  getGuildRoles,
  fetchChannelsMessages,
  sendMessage,
};
export type IpcMainDiscordApiFunctions = IpcMainEventHandlersToRendererFunctions<typeof ipcMainDiscordApiFunctions>;

export const bindIpcDiscordApiFunctions = () => {
  Object.keys(ipcMainDiscordApiFunctions).map((key) =>
    ipcMain.handle(key, ipcMainDiscordApiFunctions[key as keyof typeof ipcMainDiscordApiFunctions])
  );
};

const ipcMainDiscordApiEvents = {
  guildUpdate: null,
  guildCreate: null,
  guildDelete: null,
  channelUpdate: null,
  channelCreate: null,
  channelDelete: null,
  threadUpdate: null,
  threadCreate: null,
  threadDelete: null,
  guildMemberUpdate: null,
  guildMemberAdd: null,
  guildMemberRemove: null,
  presenceUpdate: null,
  roleUpdate: null,
  roleCreate: null,
  roleDelete: null,
  messageUpdate: (_, message) => [structMessage(message)] as const,
  messageCreate: (message) => [structMessage(message)] as const,
  messageDelete: (message) => [{ id: message.id, channelId: message.channelId }] as const,
} as const satisfies Partial<{ [K in keyof ClientEvents]: ((...args: ClientEvents[K]) => readonly any[]) | null }>;

export type IpcMainDiscordApiEvents<T = typeof ipcMainDiscordApiEvents> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? ReturnType<T[K]> : never;
};

export const bindIpcDiscordApiEvents = (webContents: WebContents) => {
  Object.keys(ipcMainDiscordApiEvents).forEach((key) =>
    client.on(key, (...args: ClientEvents[keyof IpcMainDiscordApiEvents]) =>
      // @ts-ignore
      webContents.send(key, ...(ipcMainDiscordApiEvents[key as keyof typeof ipcMainDiscordApiEvents]?.(...args) ?? []))
    )
  );
};

export const logout = async () => {
  await client.destroy();
};

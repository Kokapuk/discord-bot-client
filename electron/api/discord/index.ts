import { AttachmentBuilder } from 'discord.js';
import { IpcMainInvokeEvent } from 'electron';
import { IpcApiResponse } from '..';
import { client } from './client';
import {
  Channel,
  EditMessageDTO,
  Guild,
  Message,
  Role,
  SendMessageDTO,
  SupportedChannelType,
  SupportedMessageType,
  User,
} from './types';
import { structChannel, structGuild, structMessage, structRole, structUser } from './utils';

export const authorize = async (_: IpcMainInvokeEvent, token: string): Promise<IpcApiResponse> => {
  try {
    await client.login(token);
    await new Promise((res) => client.once('ready', res));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const getClient = (): IpcApiResponse<User> => {
  if (!client.user) {
    return { success: false, error: 'Client user does not exist' };
  }

  return { success: true, payload: structUser(client.user) };
};

export const getGuilds = (): IpcApiResponse<Guild[]> => {
  const guilds: Guild[] = client.guilds.cache.map(structGuild);

  return { success: true, payload: guilds };
};

export const getGuildChannels = (_: IpcMainInvokeEvent, guildId: string): IpcApiResponse<Channel[]> => {
  const guild = client.guilds.cache.find((guild) => guild.id === guildId);

  if (!guild) {
    return { success: false, error: 'Guild does not exist' };
  }

  const channels = guild.channels.cache
    .filter((channel) => (Object.values(SupportedChannelType) as number[]).includes(channel.type))
    .sort((channelA, channelB) => channelA.type - channelB.type)
    .map(structChannel)
    .filter(Boolean) as Channel[];

  return { success: true, payload: channels };
};

export const getGuildMembers = (_: IpcMainInvokeEvent, guildId: string): IpcApiResponse<User[]> => {
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

export const getGuildRoles = (_: IpcMainInvokeEvent, guildId: string): IpcApiResponse<Role[]> => {
  const guild = client.guilds.cache.find((guild) => guild.id === guildId);

  if (!guild) {
    return { success: false, error: 'Guild does not exist' };
  }

  const roles: Role[] = guild.roles.cache.map(structRole);

  return { success: true, payload: roles };
};

const MESSAGES_PER_PAGE = 50;

export const fetchChannelsMessages = async (
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

export const sendMessage = async (
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

export const editMessage = async (
  _: IpcMainInvokeEvent,
  messageId: string,
  channelId: string,
  editMessage: EditMessageDTO
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

    const message = channel.messages.cache.find((message) => message.id === messageId);

    if (!message) {
      return { success: false, error: 'Message does not exist' };
    }

    await message.edit(editMessage);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const deleteMessage = async (
  _: IpcMainInvokeEvent,
  messageId: string,
  channelId: string
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

    const message = channel.messages.cache.find((message) => message.id === messageId);

    if (!message) {
      return { success: false, error: 'Message does not exist' };
    }

    await message.delete();

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const replyToMessage = async (
  _: IpcMainInvokeEvent,
  messageId: string,
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

    const referenceMessage = channel.messages.cache.find((message) => message.id === messageId);

    if (!referenceMessage) {
      return { success: false, error: 'Message does not exist' };
    }

    if (!message.content && !message.files?.length) {
      return { success: false, error: 'At least one is required: content, files' };
    }

    const files = message.files?.map((file) => new AttachmentBuilder(Buffer.from(file.buffer), { name: file.name }));
    await referenceMessage.reply({ content: message.content, files });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

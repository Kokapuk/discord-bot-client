import { ActivityType, AttachmentBuilder, PresenceUpdateStatus } from 'discord.js';
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
  Status,
  SupportedChannelType,
  SupportedMessageType,
  User,
  VoiceMember,
} from './types';
import { structChannel, structGuild, structMessage, structRole, structUser, structVoiceMember } from './utils';

const PRIORITY_STATUSES = ['online', 'dnd', 'idle'] as const;

export const authorize = async (_: IpcMainInvokeEvent, token: string): Promise<IpcApiResponse> => {
  try {
    await client.login(token);
    await new Promise((res) => client.once('ready', res));

    client.user?.setPresence({
      activities: [
        {
          name: 'github.com/Kokapuk/discord-bot-client',
          url: 'https://github.com/Kokapuk/discord-bot-client',
          type: ActivityType.Custom,
        },
      ],
    });

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

export const setClientStatus = (_: IpcMainInvokeEvent, status: Exclude<Status, 'offline'>) => {
  if (!client.user) {
    return { success: false, error: 'Client user does not exist' };
  }

  let newStatus: PresenceUpdateStatus;

  switch (status) {
    case 'online':
      newStatus = PresenceUpdateStatus.Online;
      break;
    case 'idle':
      newStatus = PresenceUpdateStatus.Idle;
      break;
    case 'dnd':
      newStatus = PresenceUpdateStatus.DoNotDisturb;
      break;
    case 'invisible':
      newStatus = PresenceUpdateStatus.Invisible;
      break;
  }

  client.user.setPresence({ status: newStatus });
};

export const getGuilds = (): IpcApiResponse<Guild[]> => {
  const guilds: Guild[] = client.guilds.cache.map(structGuild);

  return { success: true, payload: guilds };
};

export const getGuildsChannels = (_: IpcMainInvokeEvent): IpcApiResponse<Record<string, Channel[]>> => {
  const guilds = client.guilds.cache;
  const guildChannels: Record<string, Channel[]> = {};

  guilds.forEach((guild) => {
    guildChannels[guild.id] = guild.channels.cache
      .filter((channel) => (Object.values(SupportedChannelType) as number[]).includes(channel.type))
      .sort((channelA, channelB) => channelA.type - channelB.type)
      .map(structChannel)
      .filter(Boolean) as Channel[];
  });

  return { success: true, payload: guildChannels };
};

export const getGuildsMembers = (_: IpcMainInvokeEvent): IpcApiResponse<Record<string, User[]>> => {
  const guilds = client.guilds.cache;
  const guildMember: Record<string, User[]> = {};

  guilds.forEach((guild) => {
    guildMember[guild.id] = guild.members.cache.map(structUser).sort((memberA, memberB) => {
      let result = 0;

      if (PRIORITY_STATUSES.includes(memberA.status as any)) {
        result--;
      }

      if (PRIORITY_STATUSES.includes(memberB.status as any)) {
        result++;
      }

      return result;
    });
  });

  return { success: true, payload: guildMember };
};

export const getGuildsRoles = (_: IpcMainInvokeEvent): IpcApiResponse<Record<string, Role[]>> => {
  const guilds = client.guilds.cache;
  const guildRoles: Record<string, Role[]> = {};

  guilds.forEach((guild) => {
    guildRoles[guild.id] = guild.roles.cache.map(structRole);
  });

  return { success: true, payload: guildRoles };
};

const MESSAGES_PER_PAGE = 50;

export const fetchChannelMessages = async (
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

export const getGuildsVoiceChannelsMembers = (
  _: IpcMainInvokeEvent
): IpcApiResponse<Record<string, Record<string, VoiceMember[]>>> => {
  const guilds = client.guilds.cache;
  const guildVoiceChannelsMembers: Record<string, Record<string, VoiceMember[]>> = {};

  guilds.forEach((guild) => {
    const membersInVoice = guild.members.cache.filter((member) => !!member.voice.channel);

    membersInVoice.forEach((member) => {
      if (!guildVoiceChannelsMembers[guild.id]) {
        guildVoiceChannelsMembers[guild.id] = {};
      }

      if (!guildVoiceChannelsMembers[guild.id][member.voice.channelId!]) {
        guildVoiceChannelsMembers[guild.id][member.voice.channelId!] = [];
      }

      guildVoiceChannelsMembers[guild.id][member.voice.channelId!].push(structVoiceMember(member));
    });
  });

  return { success: true, payload: guildVoiceChannelsMembers };
};

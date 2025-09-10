import { Channel as DiscordChannel, DMChannel as DiscordDmChannel, PermissionFlagsBits } from 'discord.js';
import { structUser } from '../users/utils';
import { ChannelType, DmChannel, GuildChannel, GuildTextChannel, GuildVoiceChannel } from './types';

export const structGuildChannel = (channel: DiscordChannel): GuildChannel | null => {
  if (channel.isDMBased() || !Object.values(ChannelType).includes(channel.type as number)) {
    return null;
  }

  const channelPermissions = channel.guild.members.me ? channel.permissionsFor(channel.guild.members.me) : null;

  const textChannel: GuildTextChannel = {
    id: channel.id,
    name: channel.name,
    type: channel.type as number,
    guidId: channel.guildId,
    sendMessagePermission: channelPermissions?.has(PermissionFlagsBits.SendMessages) ?? false,
    attachFilesPermission: channelPermissions?.has(PermissionFlagsBits.AttachFiles) ?? false,
    manageMessagesPermission: channelPermissions?.has(PermissionFlagsBits.ManageMessages) ?? false,
    viewChannelPermission: channelPermissions?.has(PermissionFlagsBits.ViewChannel) ?? false,
  };

  if (channel.isVoiceBased()) {
    const voiceChannel: GuildVoiceChannel = {
      ...textChannel,
      type: channel.type as number,
      userLimit: channel.userLimit > 0 ? channel.userLimit : null,
      connectPermission: channelPermissions?.has(PermissionFlagsBits.Connect) ?? false,
      speakPermission: channelPermissions?.has(PermissionFlagsBits.Speak) ?? false,
    };

    return voiceChannel;
  }

  return textChannel;
};

export const structDmChannel = (channel: DiscordDmChannel): DmChannel | null => {
  if (!channel.isDMBased() || !Object.values(ChannelType).includes(channel.type as number)) {
    return null;
  }

  return {
    id: channel.id,
    type: channel.type as number,
    recipient: channel.recipient ? structUser(channel.recipient) : null,
  };
};

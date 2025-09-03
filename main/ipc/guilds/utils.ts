import {
  Channel as DiscordChannel,
  Guild as DiscordGuild,
  GuildMember as DiscordGuildMember,
  Role as DiscordRole,
  PermissionFlagsBits,
} from 'discord.js';
import { Channel, Guild, GuildMember, Role, SupportedChannelType, TextChannel, VoiceChannel } from './types';

export const structGuild = (guild: DiscordGuild): Guild => ({
  id: guild.id,
  name: guild.name,
  iconUrl: guild.iconURL({ extension: 'webp', size: 64 }),
});

export const structChannel = (channel: DiscordChannel): Channel | null => {
  if (channel.isDMBased() || !Object.values(SupportedChannelType).includes(channel.type as number)) {
    return null;
  }

  const channelPermissions = channel.guild.members.me ? channel.permissionsFor(channel.guild.members.me) : null;

  const textChannel: TextChannel = {
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
    const voiceChannel: VoiceChannel = {
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

export const structGuildMember = (member: DiscordGuildMember): GuildMember => ({
  id: member.id,
  displayName: member.displayName,
  displayAvatarUrl: member.displayAvatarURL({ size: 64 }),
  status: member.presence?.status,
  displayHexColor: member.displayHexColor === '#000000' ? undefined : member.displayHexColor,
});

export const structRole = (role: DiscordRole): Role => ({
  id: role.id,
  name: role.name,
  hexColor: role.hexColor,
});

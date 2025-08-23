import {
  Attachment as DiscordAttachment,
  Channel as DiscordChannel,
  Guild as DiscordGuild,
  Message as DiscordMessage,
  Role as DiscordRole,
  Embed as DiscordEmbed,
  GuildMember,
} from 'discord.js';
import { Attachment, Channel, Embed, Guild, Message, Role, SupportedChannelType, User } from './types';

export const structGuild = (guild: DiscordGuild): Guild => ({
  id: guild.id,
  name: guild.name,
  iconUrl: guild.iconURL({ extension: 'webp', size: 64 }),
});

export const structChannel = (channel: DiscordChannel): Channel => {
  let name: string | null = null;

  if (!channel.isDMBased()) {
    name = channel.name;
  }

  return {
    id: channel.id,
    name,
    type: channel.type as unknown as SupportedChannelType,
  };
};

export const structMember = (member: GuildMember): User => ({
  id: member.id,
  displayHexColor: member.displayHexColor === '#000000' ? '#fff' : member.displayHexColor,
  displayName: member.displayName,
  displayAvatarUrl: member.displayAvatarURL({ size: 64 }),
  status: member.presence?.status,
});

export const structRole = (role: DiscordRole): Role => ({
  id: role.id,
  name: role.name,
  hexColor: role.hexColor,
});

export const structAttachment = (attachment: DiscordAttachment): Attachment => ({
  id: attachment.id,
  url: attachment.url,
  name: attachment.name,
  contentType: attachment.contentType,
  width: attachment.width,
  height: attachment.height,
  size: attachment.size,
});

export const structEmbed = (embed: DiscordEmbed): Embed => ({
  hexColor: embed.data.color ? `#${embed.data.color.toString(16).padStart(6, '0')}` : undefined,
  title: embed.data.title,
  description: embed.data.description,
});

export const structMessage = (message: DiscordMessage): Message => ({
  id: message.id,
  authorId: message.author.id,
  channelId: message.channelId,
  content: message.content,
  createdTimestamp: message.createdTimestamp,
  editedTimestamp: message.editedTimestamp,
  attachments: message.attachments.map(structAttachment),
  embeds: message.embeds.map(structEmbed),
});

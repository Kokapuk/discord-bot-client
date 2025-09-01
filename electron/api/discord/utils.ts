import {
  APIEmbedField,
  Attachment as DiscordAttachment,
  Channel as DiscordChannel,
  Embed as DiscordEmbed,
  EmbedAssetData as DiscordEmbedAssetData,
  Guild as DiscordGuild,
  Message as DiscordMessage,
  Role as DiscordRole,
  User as DiscordUser,
  EmbedAuthorData,
  EmbedFooterData,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js';
import {
  Attachment,
  Channel,
  Embed,
  EmbedAssetData,
  EmbedAuthor,
  EmbedField,
  EmbedFooter,
  Guild,
  Message,
  Role,
  SupportedChannelType,
  SupportedMessageType,
  TextChannel,
  User,
  VoiceChannel,
  VoiceMember,
} from './types';

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

export const structUser = (user: GuildMember | DiscordUser): User => ({
  id: user.id,
  displayHexColor:
    !(user as GuildMember).displayHexColor || (user as GuildMember).displayHexColor === '#000000'
      ? undefined
      : (user as GuildMember).displayHexColor,
  displayName: user.displayName,
  displayAvatarUrl: user.displayAvatarURL({ size: 64 }),
  status: (user as GuildMember).presence?.status,
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

export const structEmbedAuthor = (author: EmbedAuthorData): EmbedAuthor => ({
  name: author.name,
  url: author.url,
  iconURL: author.iconURL,
});

export const structEmbedAssetData = (assetData: DiscordEmbedAssetData): EmbedAssetData => ({
  url: assetData.url,
  width: assetData.width,
  height: assetData.height,
});

export const structEmbedField = (field: APIEmbedField): EmbedField => ({
  name: field.name,
  value: field.value,
  inline: field.inline,
});

export const structEmbedFooter = (footer: EmbedFooterData): EmbedFooter => ({
  text: footer.text,
  iconURL: footer.iconURL,
});

export const structEmbed = (embed: DiscordEmbed): Embed => ({
  type: embed.data.type,
  hexColor: embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : null,
  title: embed.title,
  description: embed.description,
  url: embed.url,
  author: embed.author ? structEmbedAuthor(embed.author) : null,
  thumbnail: embed.thumbnail ? structEmbedAssetData(embed.thumbnail) : null,
  fields: embed.fields.map(structEmbedField),
  image: embed.image ? structEmbedAssetData(embed.image) : null,
  video: embed.video ? structEmbedAssetData(embed.video) : null,
  timestamp: embed.timestamp,
  footer: embed.footer ? structEmbedFooter(embed.footer) : null,
  provider: embed.provider?.name ?? null,
});

export const structMessage = (message: DiscordMessage): Message => ({
  id: message.id,
  type: message.type as unknown as SupportedMessageType,
  authorId: message.author.id,
  fallbackAuthor: structUser(message.author),
  channelId: message.channelId,
  guildId: message.guildId,
  content: message.content,
  createdTimestamp: message.createdTimestamp,
  editedTimestamp: message.editedTimestamp,
  attachments: message.attachments.map(structAttachment),
  embeds: message.embeds.map(structEmbed),
  referenceMessageId: message.reference?.messageId ?? null,
  clientMentioned: message.mentions.has(message.client.user),
});

export const structVoiceMember = (user: GuildMember): VoiceMember => ({
  id: user.id,
  displayName: user.displayName,
  displayAvatarUrl: user.displayAvatarURL({ size: 64 }),
  selfMute: user.voice.selfMute,
  selfDeaf: user.voice.selfDeaf,
  serverMute: user.voice.serverMute,
  serverDeaf: user.voice.serverDeaf,
  canSpeak: user.voice.channel?.permissionsFor(user).has(PermissionFlagsBits.Speak) ?? false
});

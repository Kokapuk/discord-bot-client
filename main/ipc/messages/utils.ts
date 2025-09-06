import {
  APIEmbedField,
  Attachment as DiscordAttachment,
  Embed as DiscordEmbed,
  EmbedAssetData as DiscordEmbedAssetData,
  Message as DiscordMessage,
  EmbedAuthorData,
  EmbedFooterData,
  MessageSnapshot as DiscordMessageSnapshot,
} from 'discord.js';
import { structUser } from '../client/utils';
import {
  Attachment,
  Embed,
  EmbedAssetData,
  EmbedAuthor,
  EmbedField,
  EmbedFooter,
  Message,
  MessageSnapshot,
  SupportedMessageType,
} from './types';

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

export const structMessageSnapshot = (message: DiscordMessageSnapshot): MessageSnapshot => ({
  id: message.id,
  type: message.type as number,
  content: message.content,
  attachments: message.attachments.map(structAttachment),
  embeds: message.embeds.map(structEmbed),
});

export const structMessage = (message: DiscordMessage): Message => ({
  id: message.id,
  type: message.type as number,
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
  messageSnapshots: message.messageSnapshots
    .filter((message) => (Object.values(SupportedMessageType) as number[]).includes(message.type))
    .map(structMessageSnapshot),
});

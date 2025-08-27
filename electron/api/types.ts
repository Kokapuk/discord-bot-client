export interface Guild {
  id: string;
  name: string;
  iconUrl: string | null;
}

export enum SupportedChannelType {
  GuildText = 0,
  GuildVoice = 2,
  GuildAnnouncement = 5,
  PublicThread = 11,
  PrivateThread = 12,
}

export interface Channel {
  id: string;
  name: string | null;
  type: SupportedChannelType;
  sendMessagePermission: boolean;
  attachFilesPermission: boolean;
  manageMessagesPermission: boolean;
  viewChannelPermission: boolean;
}

export interface User {
  id: string;
  displayHexColor?: `#${string}`;
  displayName: string;
  displayAvatarUrl: string;
  status: 'online' | 'idle' | 'dnd' | 'invisible' | 'offline' | undefined;
}

export interface Role {
  id: string;
  name: string;
  hexColor: `#${string}`;
}

export enum SupportedMessageType {
  Default = 0,
  Reply = 19,
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
  contentType: string | null;
  width: number | null;
  height: number | null;
  size: number;
}

export type EmbedType =
  | 'rich'
  | 'image'
  | 'video'
  | 'gifv'
  | 'article'
  | 'link'
  | 'auto_moderation_message'
  | 'poll_result';

export interface EmbedAuthor {
  name: string;
  url?: string;
  iconURL?: string;
}

export interface EmbedAssetData {
  url: string;
  height?: number;
  width?: number;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedFooter {
  text: string;
  iconURL?: string;
}

export interface Embed {
  type?: EmbedType;
  hexColor: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
  author: EmbedAuthor | null;
  thumbnail: EmbedAssetData | null;
  fields: EmbedField[];
  image: EmbedAssetData | null;
  video: EmbedAssetData | null;
  timestamp: string | null;
  footer: EmbedFooter | null;
  provider: string | null;
}

export interface Message {
  id: string;
  type: SupportedMessageType,
  authorId: string;
  fallbackAuthor: User;
  channelId: string;
  content: string;
  createdTimestamp: number;
  editedTimestamp: number | null;
  attachments: Attachment[];
  embeds: Embed[];
  referenceMessageId: string | null;
  clientMentioned: boolean;
}

export interface SendMessageFileDTO {
  name: string;
  buffer: ArrayBuffer;
}

export interface SendMessageDTO {
  content?: string;
  files?: SendMessageFileDTO[];
}

export interface EditMessageDTO {
  content: string;
}

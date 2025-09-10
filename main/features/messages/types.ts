import { User } from '../users/types';

export enum MessageType {
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

export interface MessageSnapshot {
  id: string | null;
  type: MessageType;
  content: string;
  attachments: Attachment[];
  embeds: Embed[];
}

export interface Message {
  id: string;
  type: MessageType;
  authorId: string;
  fallbackAuthor: User;
  channelId: string;
  guildId: string | null;
  content: string;
  createdTimestamp: number;
  editedTimestamp: number | null;
  attachments: Attachment[];
  embeds: Embed[];
  referenceMessageId: string | null;
  clientMentioned: boolean;
  messageSnapshots: MessageSnapshot[];
}

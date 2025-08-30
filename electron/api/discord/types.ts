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
  GuildStageVoice = 13,
}

export interface BaseChannel {
  id: string;
  name: string;
  type: SupportedChannelType;
}

export interface TextChannel extends BaseChannel {
  type:
    | SupportedChannelType.GuildText
    | SupportedChannelType.GuildAnnouncement
    | SupportedChannelType.PublicThread
    | SupportedChannelType.PrivateThread;
  sendMessagePermission: boolean;
  attachFilesPermission: boolean;
  manageMessagesPermission: boolean;
  viewChannelPermission: boolean;
}

export interface VoiceChannel extends Omit<TextChannel, 'type'> {
  type: SupportedChannelType.GuildVoice | SupportedChannelType.GuildStageVoice;
  userLimit: number | null;
  connectPermission: boolean;
  speakPermission: boolean;
}

export type Channel = TextChannel | VoiceChannel;

export type Status = 'online' | 'idle' | 'dnd' | 'invisible' | 'offline';

export interface User {
  id: string;
  displayHexColor?: `#${string}`;
  displayName: string;
  displayAvatarUrl: string;
  status?: Status;
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
  type: SupportedMessageType;
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

export interface VoiceMember extends Pick<User, 'id' | 'displayName' | 'displayAvatarUrl'> {
  selfMute: boolean | null;
  selfDeaf: boolean | null;
  serverMute: boolean | null;
  serverDeaf: boolean | null;
}

export const isChannelVoiceBased = (channel: Channel): channel is VoiceChannel => {
  return channel.type === SupportedChannelType.GuildVoice || channel.type === SupportedChannelType.GuildStageVoice;
};

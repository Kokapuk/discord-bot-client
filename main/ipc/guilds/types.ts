import { User } from '../client/types';

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
  guidId: string;
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

export interface GuildMember extends User {
  displayHexColor?: `#${string}`;
}

export interface Role {
  id: string;
  name: string;
  hexColor: `#${string}`;
}

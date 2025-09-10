import { User } from '../users/types';
import { GuildChannelTypes, GuildTextChannelTypes, GuildVoiceChannelTypes } from './rendererSafeUtils';

export enum ChannelType {
  GuildText = 0,
  DM = 1,
  GuildVoice = 2,
  GuildAnnouncement = 5,
  PublicThread = 11,
  PrivateThread = 12,
  GuildStageVoice = 13,
}

export interface BaseChannel {
  id: string;
  type: ChannelType;
}

export type GuildChannelType = (typeof GuildChannelTypes)[number];

export interface GuildBaseChannel extends BaseChannel {
  name: string;
  guidId: string;
  type: GuildChannelType;
}

export type GuildTextChannelType = (typeof GuildTextChannelTypes)[number];

export interface GuildTextChannel extends GuildBaseChannel {
  type: GuildTextChannelType;
  sendMessagePermission: boolean;
  attachFilesPermission: boolean;
  manageMessagesPermission: boolean;
  viewChannelPermission: boolean;
}

export type GuildVoiceChannelType = (typeof GuildVoiceChannelTypes)[number];

export interface GuildVoiceChannel extends Omit<GuildTextChannel, 'type'> {
  type: ChannelType.GuildVoice | ChannelType.GuildStageVoice;
  userLimit: number | null;
  connectPermission: boolean;
  speakPermission: boolean;
}

export type GuildChannel = GuildTextChannel | GuildVoiceChannel;

export interface DmChannel extends BaseChannel {
  type: ChannelType.DM;
  recipient: User | null;
}

export type Channel = GuildChannel | DmChannel;

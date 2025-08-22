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
  name: string;
  type: SupportedChannelType;
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

export interface Message {
  id: string;
  authorId: string;
  content: string;
  createdTimestamp: number;
}

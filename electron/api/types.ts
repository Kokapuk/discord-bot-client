export enum SupportedChannelType {
  GuildText = 0,
  GuildVoice = 2,
  GuildAnnouncement = 5,
  PublicThread = 11,
  PrivateThread = 12,
}

export interface Guild {
  id: string;
  name: string;
  iconUrl: string | null;
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

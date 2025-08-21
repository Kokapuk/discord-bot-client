export enum SupportedChannelType {
  GuildText = 0,
  GuildVoice = 2,
  GuildAnnouncement = 5,
}

export interface Channel {
  id: string;
  name: string;
  type: SupportedChannelType;
}

export interface Guild {
  id: string;
  name: string;
  iconUrl: string | null;
}

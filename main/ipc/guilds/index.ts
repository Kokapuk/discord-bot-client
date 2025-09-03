import { IpcApiResponse } from '..';
import { CreateIpcSlice } from '../../utils/ipc';
import { Channel, Guild, GuildMember, Role } from './types';

export type GuildsIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    getGuilds: () => Promise<IpcApiResponse<Guild[]>>;
    getGuildsChannels: () => Promise<IpcApiResponse<Record<string, Channel[]>>>;
    getGuildsMembers: () => Promise<IpcApiResponse<Record<string, GuildMember[]>>>;
    getGuildsRoles: () => Promise<IpcApiResponse<Record<string, Role[]>>>;
  };
  mainToRenderer: {
    guildUpdate: () => void;
    guildCreate: () => void;
    guildDelete: () => void;
    channelUpdate: () => void;
    channelCreate: () => void;
    channelDelete: () => void;
    threadUpdate: () => void;
    threadCreate: () => void;
    threadDelete: () => void;
    guildMemberUpdate: () => void;
    guildMemberAdd: () => void;
    guildMemberRemove: () => void;
    presenceUpdate: () => void;
    roleUpdate: () => void;
    roleCreate: () => void;
    roleDelete: () => void;
  };
}>;

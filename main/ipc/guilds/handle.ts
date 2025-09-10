import { WebContents } from 'electron';
import { GuildsIpcSlice } from '.';
import { IpcApiResponse } from '..';
import { ChannelType, GuildChannel } from '../../features/channels/types';
import { structGuildChannel } from '../../features/channels/utils';
import { Guild, GuildMember, Role } from '../../features/guilds/types';
import { structGuild, structGuildMember, structRole } from '../../features/guilds/utils';
import { createIpcMain } from '../../utils/createIpcMain';
import { client } from '../client/utils';

const ipcMain = createIpcMain<GuildsIpcSlice>();
const PRIORITY_STATUSES = ['online', 'dnd', 'idle'] as const;

export const handleIpcMainEvents = () => {
  ipcMain.handle('getGuilds', async () => {
    const guilds: Guild[] = client.guilds.cache.map(structGuild);

    return { success: true, payload: guilds } as IpcApiResponse<Guild[]>;
  });

  ipcMain.handle('getGuildsChannels', async () => {
    const guilds = client.guilds.cache;
    const guildsChannels: Record<string, GuildChannel[]> = {};

    guilds.forEach((guild) => {
      guildsChannels[guild.id] = guild.channels.cache
        .filter((channel) => (Object.values(ChannelType) as number[]).includes(channel.type))
        .sort((channelA, channelB) => channelA.type - channelB.type)
        .map(structGuildChannel)
        .filter(Boolean) as unknown as GuildChannel[];
    });

    return { success: true, payload: guildsChannels } as IpcApiResponse<Record<string, GuildChannel[]>>;
  });

  ipcMain.handle('getGuildsMembers', async () => {
    const guilds = client.guilds.cache;
    const guildsMembers: Record<string, GuildMember[]> = {};

    guilds.forEach((guild) => {
      guildsMembers[guild.id] = guild.members.cache.map(structGuildMember).sort((memberA, memberB) => {
        let result = 0;

        if (PRIORITY_STATUSES.includes(memberA.status as any)) {
          result--;
        }

        if (PRIORITY_STATUSES.includes(memberB.status as any)) {
          result++;
        }

        return result;
      });
    });

    return { success: true, payload: guildsMembers } as IpcApiResponse<Record<string, GuildMember[]>>;
  });

  ipcMain.handle('getGuildsRoles', async () => {
    const guilds = client.guilds.cache;
    const guildsRoles: Record<string, Role[]> = {};

    guilds.forEach((guild) => {
      guildsRoles[guild.id] = guild.roles.cache.map(structRole);
    });

    return { success: true, payload: guildsRoles } as IpcApiResponse<Record<string, Role[]>>;
  });
};

export const handleIpcMainAutoInvokeEvents = (webContents: WebContents) => {
  client.on('guildUpdate', () => ipcMain.send(webContents, 'guildUpdate'));
  client.on('guildCreate', () => ipcMain.send(webContents, 'guildCreate'));
  client.on('guildDelete', () => ipcMain.send(webContents, 'guildDelete'));
  client.on('channelUpdate', () => ipcMain.send(webContents, 'channelUpdate'));
  client.on('channelCreate', () => ipcMain.send(webContents, 'channelCreate'));
  client.on('channelDelete', () => ipcMain.send(webContents, 'channelDelete'));
  client.on('threadUpdate', () => ipcMain.send(webContents, 'threadUpdate'));
  client.on('threadCreate', () => ipcMain.send(webContents, 'threadCreate'));
  client.on('threadDelete', () => ipcMain.send(webContents, 'threadDelete'));
  client.on('guildMemberUpdate', () => ipcMain.send(webContents, 'guildMemberUpdate'));
  client.on('guildMemberAdd', () => ipcMain.send(webContents, 'guildMemberAdd'));
  client.on('guildMemberRemove', () => ipcMain.send(webContents, 'guildMemberRemove'));
  client.on('presenceUpdate', () => ipcMain.send(webContents, 'presenceUpdate'));
  client.on('roleUpdate', () => ipcMain.send(webContents, 'roleUpdate'));
  client.on('roleCreate', () => ipcMain.send(webContents, 'roleCreate'));
  client.on('roleDelete', () => ipcMain.send(webContents, 'roleDelete'));
};

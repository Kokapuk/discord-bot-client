import { createIpcMain } from '../../utils/createIpcMain';
import { WebContents } from 'electron';
import { GuildsIpcSlice } from '.';
import { client } from '../client/utils';
import { Channel, Guild, GuildMember, Role, SupportedChannelType } from './types';
import { structChannel, structGuild, structGuildMember, structRole } from './utils';

const ipcMain = createIpcMain<GuildsIpcSlice>();
const PRIORITY_STATUSES = ['online', 'dnd', 'idle'] as const;

export const handleIpcMainEvents = () => {
  ipcMain.handle('getGuilds', () => {
    const guilds: Guild[] = client.guilds.cache.map(structGuild);

    return { success: true, payload: guilds };
  });

  ipcMain.handle('getGuildsChannels', () => {
    const guilds = client.guilds.cache;
    const guildsChannels: Record<string, Channel[]> = {};

    guilds.forEach((guild) => {
      guildsChannels[guild.id] = guild.channels.cache
        .filter((channel) => (Object.values(SupportedChannelType) as number[]).includes(channel.type))
        .sort((channelA, channelB) => channelA.type - channelB.type)
        .map(structChannel)
        .filter(Boolean) as Channel[];
    });

    return { success: true, payload: guildsChannels };
  });

  ipcMain.handle('getGuildsMembers', () => {
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

    return { success: true, payload: guildsMembers };
  });

  ipcMain.handle('getGuildsRoles', () => {
    const guilds = client.guilds.cache;
    const guildsRoles: Record<string, Role[]> = {};

    guilds.forEach((guild) => {
      guildsRoles[guild.id] = guild.roles.cache.map(structRole);
    });

    return { success: true, payload: guildsRoles };
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

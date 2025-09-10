import { Guild as DiscordGuild, GuildMember as DiscordGuildMember, Role as DiscordRole } from 'discord.js';
import { Guild, GuildMember, Role } from './types';

export const structGuild = (guild: DiscordGuild): Guild => ({
  id: guild.id,
  name: guild.name,
  iconUrl: guild.iconURL({ extension: 'webp', size: 64 }),
});

export const structGuildMember = (member: DiscordGuildMember): GuildMember => ({
  id: member.id,
  username: member.user.username,
  displayName: member.displayName,
  displayAvatarUrl: member.displayAvatarURL({ size: 64 }),
  status: member.presence?.status,
  displayHexColor: member.displayHexColor === '#000000' ? undefined : member.displayHexColor,
});

export const structRole = (role: DiscordRole): Role => ({
  id: role.id,
  name: role.name,
  hexColor: role.hexColor,
});

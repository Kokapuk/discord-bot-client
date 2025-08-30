import { ClientEvents } from 'discord.js';
import { WebContents } from 'electron';
import { client } from './client';
import { structMessage } from './utils';

const ipcMainDiscordApiEvents = {
  guildUpdate: null,
  guildCreate: null,
  guildDelete: null,
  channelUpdate: null,
  channelCreate: null,
  channelDelete: null,
  voiceStateUpdate: null,
  threadUpdate: null,
  threadCreate: null,
  threadDelete: null,
  guildMemberUpdate: null,
  guildMemberAdd: null,
  guildMemberRemove: null,
  presenceUpdate: null,
  roleUpdate: null,
  roleCreate: null,
  roleDelete: null,
  messageUpdate: (_, message) => [structMessage(message)] as const,
  messageCreate: (message) => [structMessage(message)] as const,
  messageDelete: (message) => [{ id: message.id, channelId: message.channelId }] as const,
} as const satisfies Partial<{ [K in keyof ClientEvents]: ((...args: ClientEvents[K]) => readonly any[]) | null }>;

export type IpcMainDiscordApiEvents<T = typeof ipcMainDiscordApiEvents> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? ReturnType<T[K]> : never;
};

export const bindIpcDiscordApiEvents = (webContents: WebContents) => {
  Object.keys(ipcMainDiscordApiEvents).forEach((key) =>
    client.on(key, (...args: ClientEvents[keyof IpcMainDiscordApiEvents]) =>
      // @ts-ignore
      webContents.send(key, ...(ipcMainDiscordApiEvents[key as keyof typeof ipcMainDiscordApiEvents]?.(...args) ?? []))
    )
  );
};

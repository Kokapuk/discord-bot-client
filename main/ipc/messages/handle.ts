import { AttachmentBuilder } from 'discord.js';
import { WebContents } from 'electron';
import { MessagesIpcSlice } from '.';
import { createIpcMain } from '../../utils/createIpcMain';
import { client } from '../client/utils';
import { Message, SupportedMessageType } from './types';
import { structMessage } from './utils';

const ipcMain = createIpcMain<MessagesIpcSlice>();
const MESSAGES_PER_PAGE = 50;

export const handleIpcMainEvents = () => {
  ipcMain.handle('fetchChannelMessages', async (_, channelId, beforeMessageId) => {
    try {
      const channel = client.channels.cache.find((channel) => channel.id === channelId);

      if (!channel) {
        return { success: false, error: 'Channel does not exist' };
      }

      if (!channel.isTextBased()) {
        return { success: false, error: 'Channel is not text based' };
      }

      const messageCollection = await channel.messages.fetch({
        cache: true,
        limit: MESSAGES_PER_PAGE,
        before: beforeMessageId,
      });
      const messages: Message[] = messageCollection
        .filter((message) => (Object.values(SupportedMessageType) as number[]).includes(message.type))
        .map(structMessage);
      const topReached = messageCollection.size < MESSAGES_PER_PAGE;

      return { success: true, payload: { messages, topReached } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('sendMessage', async (_, channelId, message) => {
    try {
      const channel = client.channels.cache.find((channel) => channel.id === channelId);

      if (!channel) {
        return { success: false, error: 'Channel does not exist' };
      }

      if (!channel.isTextBased()) {
        return { success: false, error: 'Channel is not text based' };
      }

      if (!channel.isSendable()) {
        return { success: false, error: 'Channel is not sendable' };
      }

      if (!message.content && !message.files?.length) {
        return { success: false, error: 'At least one is required: content, files' };
      }

      const files = message.files?.map((file) => new AttachmentBuilder(Buffer.from(file.buffer), { name: file.name }));
      await channel.send({ content: message.content, files });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('editMessage', async (_, messageId, channelId, editMessage) => {
    try {
      const channel = client.channels.cache.find((channel) => channel.id === channelId);

      if (!channel) {
        return { success: false, error: 'Channel does not exist' };
      }

      if (!channel.isTextBased()) {
        return { success: false, error: 'Channel is not text based' };
      }

      if (!channel.isSendable()) {
        return { success: false, error: 'Channel is not sendable' };
      }

      const message = channel.messages.cache.find((message) => message.id === messageId);

      if (!message) {
        return { success: false, error: 'Message does not exist' };
      }

      await message.edit(editMessage);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('deleteMessage', async (_, messageId, channelId) => {
    try {
      const channel = client.channels.cache.find((channel) => channel.id === channelId);

      if (!channel) {
        return { success: false, error: 'Channel does not exist' };
      }

      if (!channel.isTextBased()) {
        return { success: false, error: 'Channel is not text based' };
      }

      if (!channel.isSendable()) {
        return { success: false, error: 'Channel is not sendable' };
      }

      const message = channel.messages.cache.find((message) => message.id === messageId);

      if (!message) {
        return { success: false, error: 'Message does not exist' };
      }

      await message.delete();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('replyToMessage', async (_, messageId, channelId, message) => {
    try {
      const channel = client.channels.cache.find((channel) => channel.id === channelId);

      if (!channel) {
        return { success: false, error: 'Channel does not exist' };
      }

      if (!channel.isTextBased()) {
        return { success: false, error: 'Channel is not text based' };
      }

      if (!channel.isSendable()) {
        return { success: false, error: 'Channel is not sendable' };
      }

      const referenceMessage = channel.messages.cache.find((message) => message.id === messageId);

      if (!referenceMessage) {
        return { success: false, error: 'Message does not exist' };
      }

      if (!message.content && !message.files?.length) {
        return { success: false, error: 'At least one is required: content, files' };
      }

      const files = message.files?.map((file) => new AttachmentBuilder(Buffer.from(file.buffer), { name: file.name }));
      await referenceMessage.reply({ content: message.content, files });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
};

export const handleIpcMainAutoInvokeEvents = (webContents: WebContents) => {
  client.on('messageUpdate', (_, message) => ipcMain.send(webContents, 'messageUpdate', structMessage(message)));
  client.on('messageCreate', (message) => ipcMain.send(webContents, 'messageCreate', structMessage(message)));
  client.on('messageDelete', (message) =>
    ipcMain.send(webContents, 'messageDelete', { id: message.id, channelId: message.channelId })
  );
};

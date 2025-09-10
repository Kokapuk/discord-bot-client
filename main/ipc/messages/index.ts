import { Message } from '@main/features/messages/types';
import { IpcApiResponse } from '..';
import { CreateIpcSlice } from '../../utils/ipc';
import { EditMessageDTO, SendMessageDTO } from './types';

export type MessagesIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    fetchChannelMessages: (
      channelId: string,
      beforeMessageId?: string
    ) => Promise<IpcApiResponse<{ messages: Message[]; topReached: boolean }>>;

    sendMessage: (channelId: string, message: SendMessageDTO) => Promise<IpcApiResponse>;
    editMessage: (messageId: string, channelId: string, editMessage: EditMessageDTO) => Promise<IpcApiResponse>;
    deleteMessage: (messageId: string, channelId: string) => Promise<IpcApiResponse>;
    replyToMessage: (referenceMessageId: string, channelId: string, message: SendMessageDTO) => Promise<IpcApiResponse>;
  };
  mainToRenderer: {
    messageUpdate: (message: Message) => void;
    messageCreate: (message: Message) => void;
    messageDelete: (message: { id: string; channelId: string }) => void;
  };
}>;

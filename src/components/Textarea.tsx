import { BoxProps, Textarea as ChakraTextarea, FileUpload, IconButton, Stack, useFileUpload } from '@chakra-ui/react';
import { Channel, EditMessageDTO, Message, SendMessageDTO, SendMessageFileDTO } from '@main/api/types';
import { ipcRendererDiscordApiFunctions } from '@renderer/api/discord';
import fileSchema from '@renderer/utils/fileSchema';
import dayjs from 'dayjs';
import React, { RefAttributes, useRef } from 'react';
import { FaFileCirclePlus } from 'react-icons/fa6';
import z from 'zod';
import FileUploadList from './FileUploadList';
import TextareaActionContext from './TextareaActionContext';

export type TextareaProps = {
  channel: Channel;
  editingMessage?: Message | null;
  onEditCancel?(): void;
} & BoxProps &
  RefAttributes<HTMLDivElement>;

export const messageFormDataSchema = z.object({
  content: z.string().max(2000, { error: (iss) => `Message must not be longer than ${iss.maximum}` }),
  files: z.array(fileSchema, { error: 'Files are invalid' }).optional(),
});

export default function Textarea({ channel, editingMessage, onEditCancel, ...props }: TextareaProps) {
  const form = useRef<HTMLFormElement>(null);
  const canAttachFiles = channel.attachFilesPermission && !editingMessage;
  const sending = useRef(false);

  const fileUpload = useFileUpload({
    maxFiles: 10,
    maxFileSize: 8_000_000,
    validate: (file, details) => {
      if (!canAttachFiles) {
        return ['TOO_MANY_FILES'];
      }

      if (
        details.acceptedFiles.some((acceptedFile) => acceptedFile.size === file.size && acceptedFile.name === file.name)
      ) {
        return ['FILE_EXISTS'];
      }

      return null;
    },
  });

  const sendMessage = async (form: HTMLFormElement) => {
    const messageFormData = messageFormDataSchema.parse({
      ...Object.fromEntries(new FormData(form).entries()),
      files: fileUpload.acceptedFiles,
    });
    messageFormData.content = messageFormData.content.trim();

    if (!messageFormData.content && !messageFormData.files?.length) {
      return;
    }

    sending.current = true;

    const files: SendMessageFileDTO[] = [];

    if (messageFormData.files) {
      for (const file of messageFormData.files) {
        const fileBuffer = await file.arrayBuffer();
        files.push({ name: file.name, buffer: fileBuffer });
      }
    }

    const message: SendMessageDTO = {
      content: messageFormData.content,
      files,
    };

    const response = await ipcRendererDiscordApiFunctions.sendMessage(channel.id, message);

    sending.current = false;

    if (!response.success) {
      console.error(`Failed to send message: ${response.error}`);
      return;
    }

    form.reset();
    fileUpload.clearFiles();
  };

  const editMessage = async (form: HTMLFormElement) => {
    if (!editingMessage) {
      return;
    }

    const messageFormData = messageFormDataSchema.parse({ ...Object.fromEntries(new FormData(form).entries()) });
    messageFormData.content = messageFormData.content.trim();

    if (!messageFormData.content) {
      return;
    }

    sending.current = true;

    const message: EditMessageDTO = {
      content: messageFormData.content,
    };

    const response = await ipcRendererDiscordApiFunctions.editMessage(editingMessage.id, channel.id, message);

    sending.current = false;

    if (!response.success) {
      console.error(`Failed to edit message: ${response.error}`);
      return;
    }

    onEditCancel?.();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (sending.current) {
      return;
    }

    const form = event.currentTarget;

    if (editingMessage) {
      editMessage(form);
    } else {
      sendMessage(form);
    }
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || !form.current) {
      return;
    }

    event.preventDefault();
    form.current.requestSubmit();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const newFiles = Array.from(event.clipboardData.files).map(
      (file, index) =>
        new File([file], `${dayjs().format('HH-mm-ss-SSS')}-${index}.${file.name.split('.').pop()}`, {
          type: file.type,
        })
    );

    fileUpload.setFiles([...fileUpload.acceptedFiles, ...newFiles]);
  };

  if (!channel.sendMessagePermission && !editingMessage) {
    return null;
  }

  return (
    <FileUpload.RootProvider value={fileUpload} {...props}>
      <Stack ref={form as any} as="form" onSubmit={handleSubmit as any} width="100%" gap="0">
        {!!editingMessage && (
          <TextareaActionContext label="Editing message" onCancel={onEditCancel} borderBottomRadius="0" />
        )}
        <Stack
          gap="2.5"
          backgroundColor="gray.900"
          borderRadius="md"
          borderTopRadius={!!editingMessage ? '0' : undefined}
          width="100%"
        >
          {!!fileUpload.acceptedFiles.length && (
            <FileUploadList fileUpload={fileUpload} padding="4" paddingBottom="2" width="100%" overflow="auto" />
          )}
          <Stack gap="1.5" direction="row">
            <FileUpload.HiddenInput />
            {canAttachFiles && (
              <FileUpload.Trigger asChild>
                <IconButton
                  aria-label="Add attachment"
                  variant="ghost"
                  borderRadius="full"
                  marginLeft="2.5"
                  marginTop="1.5"
                >
                  <FaFileCirclePlus />
                </IconButton>
              </FileUpload.Trigger>
            )}
            <ChakraTextarea
              key={editingMessage?.id ?? 'newMessage'}
              autoresize
              placeholder="Message"
              maxLength={2000}
              name="content"
              defaultValue={editingMessage?.content}
              onKeyDown={handleKeydown}
              onPaste={handlePaste}
              variant="subtle"
              width="100%"
              minWidth="0"
              maxHeight="96"
              fontSize="md"
            />
          </Stack>
        </Stack>
      </Stack>
    </FileUpload.RootProvider>
  );
}

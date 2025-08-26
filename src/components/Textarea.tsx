import { Textarea as ChakraTextarea, FileUpload, IconButton, Stack, StackProps, useFileUpload } from '@chakra-ui/react';
import { Channel, SendMessageDTO, SendMessageFileDTO } from '@main/api/types';
import { ipcRendererDiscordApiFunctions } from '@renderer/api/discord';
import fileSchema from '@renderer/utils/fileSchema';
import dayjs from 'dayjs';
import React, { RefAttributes, useRef } from 'react';
import { FaFileCirclePlus } from 'react-icons/fa6';
import z from 'zod';
import FileUploadList from './FileUploadList';

export type TextareaProps = { channel: Channel } & StackProps & RefAttributes<HTMLDivElement>;

export const messageFormDataSchema = z.object({
  content: z.string().max(2000, { error: (iss) => `Message must not be longer than ${iss.maximum}` }),
  files: z.array(fileSchema, { error: 'Files are invalid' }),
});

export default function Textarea({ channel, ...props }: TextareaProps) {
  const form = useRef<HTMLFormElement>(null);
  const fileUpload = useFileUpload({
    maxFiles: 10,
    maxFileSize: 8_000_000,
    validate: (file, details) => {
      if (!channel.attachFilesPermission) {
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

  const sending = useRef(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (sending.current) {
      return;
    }

    const form = event.currentTarget;
    const messageFormData = messageFormDataSchema.parse({
      ...Object.fromEntries(new FormData(form).entries()),
      files: fileUpload.acceptedFiles,
    });
    messageFormData.content = messageFormData.content.trim();

    if (!messageFormData.content && !messageFormData.files.length) {
      return;
    }

    sending.current = true;

    const files: SendMessageFileDTO[] = [];

    for (const file of messageFormData.files) {
      const fileBuffer = await file.arrayBuffer();
      files.push({ name: file.name, buffer: fileBuffer });
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

  if (!channel.sendMessagePermission) {
    return null;
  }

  return (
    <FileUpload.RootProvider value={fileUpload}>
      <form ref={form} onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Stack gap="2.5" backgroundColor="gray.900" borderRadius="md" {...props}>
          {!!fileUpload.acceptedFiles.length && (
            <FileUploadList fileUpload={fileUpload} padding="4" paddingBottom="2" width="100%" overflow="auto" />
          )}
          <Stack gap="1.5" direction="row">
            <FileUpload.HiddenInput />
            {channel.attachFilesPermission && (
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
              autoresize
              placeholder="Message"
              variant="subtle"
              width="100%"
              minWidth="0"
              maxHeight="96"
              fontSize="md"
              maxLength={2000}
              name="content"
              onKeyDown={handleKeydown}
              onPaste={handlePaste}
            />
          </Stack>
        </Stack>
      </form>
    </FileUpload.RootProvider>
  );
}

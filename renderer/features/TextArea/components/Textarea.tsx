import {
  BoxProps,
  Textarea as ChakraTextarea,
  TextareaProps as ChakraTextareaProps,
  FileUpload,
  IconButton,
  Stack,
  useFileUpload,
} from '@chakra-ui/react';
import { isChannelDmBased } from '@main/features/channels/rendererSafeUtils';
import { EditMessageDTO, SendMessageDTO, SendMessageFileDTO } from '@main/ipc/messages/types';
import { Tooltip } from '@renderer/ui/Tooltip';
import fileSchema from '@renderer/utils/fileSchema';
import dayjs from 'dayjs';
import React, { memo, RefAttributes, useEffect, useMemo, useRef, useState } from 'react';
import { FaFileCirclePlus, FaPaperPlane } from 'react-icons/fa6';
import { useContextSelector } from 'use-context-selector';
import z from 'zod';
import { TextareaContext } from '../context';
import FileUploadList from './FileUploadList';
import MentionMenu from './MentionMenu';
import TextareaActionContext from './TextareaActionContext';
import TextareaReplyContext from './TextareaReplyContext';

export type TextareaProps = { textareaProps?: ChakraTextareaProps & RefAttributes<HTMLTextAreaElement> } & BoxProps &
  RefAttributes<HTMLDivElement>;

export const messageFormDataSchema = z.object({
  content: z
    .string()
    .trim()
    .max(2000, { error: (iss) => `Message must not be longer than ${iss.maximum}` }),
  files: z.array(fileSchema, { error: 'Files are invalid' }).optional(),
});

const Textarea = ({ textareaProps, ...props }: TextareaProps) => {
  const channel = useContextSelector(TextareaContext, (c) => c!.channel);
  const editingMessage = useContextSelector(TextareaContext, (c) => c?.editingMessage);
  const onEditClose = useContextSelector(TextareaContext, (c) => c?.onEditClose);
  const replyingMessage = useContextSelector(TextareaContext, (c) => c?.replyingMessage);
  const onReplyClose = useContextSelector(TextareaContext, (c) => c?.onReplyClose);
  const form = useRef<HTMLFormElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const canAttachFiles = (isChannelDmBased(channel) ? true : channel.attachFilesPermission) && !editingMessage;
  const [isSending, setSending] = useState(false);
  const attached = useMemo(() => !!editingMessage || !!replyingMessage, [!!editingMessage, !!replyingMessage]);

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

  useEffect(() => {
    if (!textarea.current) {
      return;
    }

    if (editingMessage || replyingMessage) {
      textarea.current?.focus();
    }

    if (editingMessage) {
      textarea.current.setSelectionRange(editingMessage.content.length, editingMessage.content.length);
    }
  }, [!!editingMessage, !!replyingMessage]);

  const sendMessage = async (form: HTMLFormElement) => {
    const messageFormData = messageFormDataSchema.parse({
      ...Object.fromEntries(new FormData(form).entries()),
      files: fileUpload.acceptedFiles,
    });

    if (!messageFormData.content && !messageFormData.files?.length) {
      return;
    }

    setSending(true);

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

    const response = replyingMessage
      ? await window.ipcRenderer.invoke('replyToMessage', replyingMessage.id, channel.id, message)
      : await window.ipcRenderer.invoke('sendMessage', channel.id, message);

    setSending(false);

    if (!response.success) {
      console.error(`Failed to send message: ${response.error}`);
      return;
    }

    form.reset();
    fileUpload.clearFiles();

    if (replyingMessage) {
      onReplyClose?.();
    }
  };

  const editMessage = async (form: HTMLFormElement) => {
    if (!editingMessage) {
      return;
    }

    const messageFormData = messageFormDataSchema.parse({ ...Object.fromEntries(new FormData(form).entries()) });

    if (!messageFormData.content) {
      return;
    }

    setSending(true);

    const message: EditMessageDTO = {
      content: messageFormData.content,
    };

    const response = await window.ipcRenderer.invoke('editMessage', editingMessage.id, channel.id, message);

    setSending(false);

    if (!response.success) {
      console.error(`Failed to edit message: ${response.error}`);
      return;
    }

    onEditClose?.();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSending) {
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

  if (!isChannelDmBased(channel) && !channel.sendMessagePermission && !editingMessage) {
    return null;
  }

  return (
    <FileUpload.RootProvider value={fileUpload} {...props}>
      <Stack ref={form as any} as="form" onSubmit={handleSubmit as any} width="100%" gap="0">
        <MentionMenu textarea={textarea} />
        {!!editingMessage && (
          <TextareaActionContext label="Editing message" onCancel={onEditClose} borderBottomRadius="0" />
        )}
        {!!replyingMessage && <TextareaReplyContext message={replyingMessage} borderBottomRadius="0" />}
        <Stack
          gap="2.5"
          backgroundColor="bg.transparentPanel"
          borderRadius="md"
          borderTopRadius={attached ? '0' : undefined}
          width="100%"
        >
          {!!fileUpload.acceptedFiles.length && (
            <FileUploadList fileUpload={fileUpload} padding="4" paddingBottom="2" width="100%" overflow="auto" />
          )}
          <Stack gap="1.5" direction="row">
            <FileUpload.HiddenInput />
            {canAttachFiles && (
              <Tooltip content="Attach files">
                <FileUpload.Trigger asChild>
                  <IconButton variant="ghost" borderRadius="full" marginLeft="2.5" marginTop="1.5">
                    <FaFileCirclePlus />
                  </IconButton>
                </FileUpload.Trigger>
              </Tooltip>
            )}

            <ChakraTextarea
              key={editingMessage?.id ?? 'newMessage'}
              ref={textarea}
              autoresize
              placeholder="Message"
              maxLength={2000}
              name="content"
              defaultValue={editingMessage?.content}
              onKeyDown={handleKeydown}
              onPaste={handlePaste}
              backgroundColor="transparent"
              width="100%"
              minWidth="0"
              maxHeight="96"
              fontSize="md"
              border="0"
              {...textareaProps}
            />

            <Tooltip content="Send">
              <IconButton
                onClick={() => form.current?.requestSubmit()}
                loading={isSending}
                variant="ghost"
                borderRadius="full"
                marginRight="2.5"
                marginTop="1.5"
              >
                <FaPaperPlane />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </FileUpload.RootProvider>
  );
};

export default memo(Textarea);

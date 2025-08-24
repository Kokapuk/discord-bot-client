import { Textarea as ChakraTextarea, IconButton, Stack, StackProps } from '@chakra-ui/react';
import React, { RefAttributes, useRef } from 'react';
import { FaFileCirclePlus } from 'react-icons/fa6';
import z from 'zod';

export type TextareaProps = StackProps & RefAttributes<HTMLDivElement>;

export const MessageFormData = z.object({
  content: z.string().max(2000, { error: (iss) => `Message must not be longer than ${iss.maximum}` }),
});

export default function Textarea(props: TextareaProps) {
  const form = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = MessageFormData.parse(Object.fromEntries(new FormData(event.currentTarget).entries()));
    console.log(message);

    event.currentTarget.reset();
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || !form.current) {
      return;
    }

    event.preventDefault();
    form.current.requestSubmit();
  };

  return (
    <form ref={form} onSubmit={handleSubmit}>
      <Stack gap="1.5" direction="row" backgroundColor="gray.900" borderRadius="md" {...props}>
        <IconButton aria-label="Add attachment" variant="ghost" borderRadius="full" marginLeft="2.5" marginTop="1.5">
          <FaFileCirclePlus />
        </IconButton>
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
        />
      </Stack>
    </form>
  );
}

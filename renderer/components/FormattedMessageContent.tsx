import { Image, Text, TextProps } from '@chakra-ui/react';
import Link from '@renderer/ui/Link';
import { Fragment, ReactNode, RefAttributes, useMemo } from 'react';
import reactStringReplace from 'react-string-replace';
import Mention from './Mention';
import { useMessageContext } from '../providers/MessageContext';

export type FormattedMessageContentProps = {
  rawContent: string;
  oneLine?: boolean;
} & TextProps &
  RefAttributes<HTMLParagraphElement>;

export default function FormattedMessageContent({ rawContent, oneLine, ...props }: FormattedMessageContentProps) {
  const { channels, users, roles } = useMessageContext();

  const formattedContent = useMemo(() => {
    let tokenized: ReactNode[] = [rawContent];

    if (oneLine) {
      tokenized = reactStringReplace(tokenized, /(\n)/, (url, index) => (
        <Fragment key={`newLines-${index}`}>{url}</Fragment>
      ));
    }

    tokenized = reactStringReplace(
      tokenized,
      /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/,
      (url, index) => (
        <Link key={`link-${index}`} to={url} target="_blank" wordBreak="break-word">
          {url}
        </Link>
      )
    );

    tokenized = reactStringReplace(tokenized, /<:.+?:(\d+?)>/, (emojiId, index) => (
      <Image
        key={`emoji-${index}`}
        loading="lazy"
        src={`https://cdn.discordapp.com/emojis/${emojiId}.png`}
        width="1.375em"
        height="1.375em"
        objectFit="contain"
        display="inline-block"
      />
    ));

    tokenized = reactStringReplace(tokenized, /<a:.+?:(\d+?)>/, (emojiId, index) => (
      <Image
        key={`animatedEmoji-${index}`}
        loading="lazy"
        src={`https://cdn.discordapp.com/emojis/${emojiId}.gif`}
        width="1.375em"
        height="1.375em"
        objectFit="contain"
        display="inline-block"
      />
    ));

    tokenized = reactStringReplace(tokenized, /@(everyone|here)/g, (token, index) => (
      <Mention key={`everyoneHere-${index}`}>@{token}</Mention>
    ));
    tokenized = reactStringReplace(tokenized, /<#(\d+?)>/g, (channelId, index) => (
      <Mention key={`channel-${index}`}>
        #{channels?.find((channel) => channel.id === channelId)?.name ?? 'unknown-channel'}
      </Mention>
    ));
    tokenized = reactStringReplace(tokenized, /<@(\d+?)>/g, (userId, index) => (
      <Mention key={`user-${index}`}>
        @{users?.find((user) => user.id === userId)?.displayName ?? 'unknown-user'}
      </Mention>
    ));
    tokenized = reactStringReplace(tokenized, /<@&(\d+?)>/g, (roleId, index) => (
      <Mention key={`role-${index}`}>@{roles?.find((role) => role.id === roleId)?.name ?? 'unknown-role'}</Mention>
    ));

    tokenized = tokenized.filter(Boolean);

    tokenized = tokenized.map((token, index) =>
      typeof token === 'string' ? (
        <Text key={`text-${index}`} as="span" whiteSpace={oneLine ? 'pre' : 'pre-wrap'}>
          {token}
        </Text>
      ) : (
        token
      )
    );

    return tokenized;
  }, [rawContent, channels, users, roles]);

  return (
    <Text as="span" fontSize="md" {...props}>
      {formattedContent}
    </Text>
  );
}

import { Image, Text, TextProps } from '@chakra-ui/react';
import { isChannelDmBased } from '@main/features/channels/rendererSafeUtils';
import Link from '@renderer/ui/Link';
import { Fragment, memo, ReactNode, RefAttributes, useMemo } from 'react';
import reactStringReplace from 'react-string-replace';
import { useMessageContext } from '../context';
import Mention from './Mention';

export type FormattedMessageContentBaseProps = { rawContent: string; oneLine?: boolean };
export type FormattedMessageContentProps = FormattedMessageContentBaseProps &
  TextProps &
  RefAttributes<HTMLParagraphElement>;

const FormattedMessageContent = ({ rawContent, oneLine, ...props }: FormattedMessageContentProps) => {
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

    tokenized = reactStringReplace(tokenized, /@(everyone|here)/, (token, index) => (
      <Mention key={`everyoneHere-${index}`}>@{token}</Mention>
    ));

    tokenized = reactStringReplace(tokenized, /<#(\d+?)>/, (channelId, index) => {
      const channel = channels?.find((channel) => channel.id === channelId);
      const channelName = channel ? (!isChannelDmBased(channel) ? channel?.name : null) : null;

      return <Mention key={`channel-${index}`}>#{channelName ?? 'unknown-channel'}</Mention>;
    });

    tokenized = reactStringReplace(tokenized, /<@!?(\d+?)>/, (userId, index) => (
      <Mention key={`user-${index}`}>
        @{users?.find((user) => user.id === userId)?.displayName ?? 'unknown-user'}
      </Mention>
    ));

    tokenized = reactStringReplace(tokenized, /<@&(\d+?)>/, (roleId, index) => (
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
  }, [rawContent, oneLine, channels, users, roles]);

  return (
    <Text as="span" fontSize="md" {...props}>
      {formattedContent}
    </Text>
  );
};

export default memo(FormattedMessageContent);

import { Link, Text, TextProps } from '@chakra-ui/react';
import useAppStore from '@renderer/stores/app';
import { ReactNode, RefAttributes, useMemo } from 'react';
import { useParams } from 'react-router';
import reactStringReplace from 'react-string-replace';
import Mention from './Mention';

export type FormattedMessageContentProps = { rawContent: string } & TextProps & RefAttributes<HTMLParagraphElement>;

export default function FormattedMessageContent({ rawContent, ...props }: FormattedMessageContentProps) {
  const { guildId } = useParams();
  const { channels, members, roles } = useAppStore();

  const formattedContent = useMemo(() => {
    let tokenized: ReactNode[] = [rawContent];

    tokenized = reactStringReplace(
      tokenized,
      /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g,
      (url, index) => (
        <Link key={`link-${index}`} href={url} target="_blank">
          {url}
        </Link>
      )
    );

    if (guildId) {
      tokenized = reactStringReplace(tokenized, /@(everyone|here)/g, (token, index) => (
        <Mention key={`everyoneHere-${index}`}>@{token}</Mention>
      ));
      tokenized = reactStringReplace(tokenized, /<#(\d+?)>/g, (channelId, index) => (
        <Mention key={`channel-${index}`}>
          #{channels[guildId].find((channel) => channel.id === channelId)?.name}
        </Mention>
      ));
      tokenized = reactStringReplace(tokenized, /<@(\d+?)>/g, (userId, index) => (
        <Mention key={`member-${index}`}>
          @{members[guildId].find((member) => member.id === userId)?.displayName}
        </Mention>
      ));
      tokenized = reactStringReplace(tokenized, /<@&(\d+?)>/g, (roleId, index) => (
        <Mention key={`role-${index}`}>@{roles[guildId].find((role) => role.id === roleId)?.name}</Mention>
      ));
    }

    return tokenized;
  }, [rawContent, channels, members, roles]);

  return (
    <Text fontSize="16px" {...props}>
      {formattedContent}
    </Text>
  );
}

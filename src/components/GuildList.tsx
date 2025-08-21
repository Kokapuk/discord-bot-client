import { Stack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import useAppStore from '../stores/app';
import Guild from './Guild';
import { handleIpcRendererDiscordApiEvents } from '../api/discord';

export default function GuildList() {
  const guildList = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const { guilds, pullGuilds } = useAppStore();

  const recalcShadows = (target: HTMLDivElement) => {
    const scrollBottom = Math.floor(target.scrollHeight - target.scrollTop - target.clientHeight);
    setShowTopShadow(target.scrollTop > 0);
    setShowBottomShadow(scrollBottom > 0);
  };

  useEffect(() => {
    if (!guilds.length) {
      pullGuilds();
    }

    const unsubscribe = handleIpcRendererDiscordApiEvents(['guildUpdate'], pullGuilds);

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (guildList.current) {
      recalcShadows(guildList.current);
    }
  }, [guilds]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    recalcShadows(event.currentTarget);
  };

  return (
    <Stack
      ref={guildList}
      onScroll={handleScroll}
      overflow="auto"
      maxHeight="100%"
      width="fit-content"
      scrollbar="hidden"
      paddingInline="10px"
      paddingBottom="10px"
      gap="15px"
      flexShrink="0"
      mask={`linear-gradient(180deg, 
        ${showTopShadow ? 'transparent' : 'black'} 0%,
        black 75px,
        black calc(100% - 75px),
        ${showBottomShadow ? 'transparent' : 'black'} 100%
      );`}
    >
      {guilds.map((guild) => (
        <Guild key={guild.id} guild={guild} />
      ))}
    </Stack>
  );
}

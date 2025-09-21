import { Stack, StackProps } from '@chakra-ui/react';
import DmChannel from '@renderer/features/Dms/components/DmChannel';
import useDmsStore from '@renderer/features/Dms/store';
import Guild from '@renderer/features/Guilds/components/Guild';
import useGuildsStore from '@renderer/features/Guilds/store';
import useMessagesStore from '@renderer/features/Messages/store';
import debounce from 'lodash/debounce';
import { memo, RefAttributes, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

const GuildDmList = ({ ref, ...props }: StackProps & RefAttributes<HTMLDivElement>) => {
  const list = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  useImperativeHandle(ref, () => list.current!, []);

  const { guilds, guildChannels } = useGuildsStore(
    useShallow((s) => ({
      guilds: s.guilds,
      guildChannels: s.channels,
    }))
  );

  const dmChannels = useDmsStore((s) => s.channels);
  const unreadChannels = useMessagesStore((s) => s.unreadChannels);

  const unreadGuilds = useMemo(
    () =>
      guilds
        ?.filter((guild) => guildChannels[guild.id]?.some((channel) => unreadChannels.includes(channel.id)))
        .map((guild) => guild.id),
    [guilds, guildChannels, unreadChannels]
  );

  const recalcShadows = (target: HTMLDivElement) => {
    const scrollBottom = Math.floor(target.scrollHeight - target.scrollTop - target.clientHeight);
    setShowTopShadow(target.scrollTop > 0);
    setShowBottomShadow(scrollBottom > 0);
  };

  useEffect(() => {
    if (list.current) {
      recalcShadows(list.current);
    }
  }, [guilds, dmChannels]);

  useEffect(() => {
    const handleRecalc = debounce(() => {
      if (list.current) {
        recalcShadows(list.current);
      }
    }, 250);

    const debouncedRecalc = debounce(handleRecalc, 250);

    window.addEventListener('resize', debouncedRecalc);

    return () => {
      window.removeEventListener('resize', debouncedRecalc);
    };
  }, []);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    recalcShadows(event.currentTarget);
  };

  return (
    <Stack
      ref={list}
      onScroll={handleScroll}
      overflow="auto"
      width="fit-content"
      scrollbar="hidden"
      gap="4"
      mask={`linear-gradient(180deg, 
        ${showTopShadow ? 'transparent' : 'black'} 0%,
        black 5rem,
        black calc(100% - 5rem),
        ${showBottomShadow ? 'transparent' : 'black'} 100%
      );`}
      {...props}
    >
      {guilds?.map((guild) => (
        <Guild
          key={guild.id}
          guild={guild}
          unread={unreadGuilds?.includes(guild.id)}
          contentVisibility="auto"
          containIntrinsicSize="auto 2.5rem"
        />
      ))}
      {Object.entries(dmChannels).map(([, channel]) => (
        <DmChannel
          key={channel.id}
          channel={channel}
          unread={unreadChannels.includes(channel.id)}
          contentVisibility="auto"
          containIntrinsicSize="auto 2.5rem"
        />
      ))}
    </Stack>
  );
};

export default memo(GuildDmList);

import { Stack, StackProps } from '@chakra-ui/react';
import useAppStore from '@renderer/stores/app';
import debounce from 'lodash/debounce';
import { RefAttributes, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Guild from './Guild';

export type GuildListProps = StackProps & RefAttributes<HTMLDivElement>;

export default function GuildList({ ref, ...props }: GuildListProps) {
  const guildList = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const { guilds } = useAppStore();
  useImperativeHandle(ref, () => guildList.current!, []);

  const recalcShadows = (target: HTMLDivElement) => {
    const scrollBottom = Math.floor(target.scrollHeight - target.scrollTop - target.clientHeight);
    setShowTopShadow(target.scrollTop > 0);
    setShowBottomShadow(scrollBottom > 0);
  };

  useEffect(() => {
    if (guildList.current) {
      recalcShadows(guildList.current);
    }
  }, [guilds]);

  useEffect(() => {
    const handleRecalc = debounce(() => {
      if (guildList.current) {
        recalcShadows(guildList.current);
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
      {...props}
    >
      {guilds.map((guild) => (
        <Guild key={guild.id} guild={guild} />
      ))}
    </Stack>
  );
}

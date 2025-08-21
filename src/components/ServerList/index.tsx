import { Avatar, Stack } from '@chakra-ui/react';
import { useLayoutEffect, useRef, useState } from 'react';

export default function ServerList() {
  const serverList = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const recalcShadows = (target: HTMLDivElement) => {
    const scrollBottom = Math.floor(target.scrollHeight - target.scrollTop - target.clientHeight);
    setShowTopShadow(target.scrollTop > 0);
    setShowBottomShadow(scrollBottom > 0);
  };

  useLayoutEffect(() => {
    if (serverList.current) {
      recalcShadows(serverList.current);
    }
  }, []);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    recalcShadows(event.currentTarget);
  };

  return (
    <Stack
      ref={serverList}
      onScroll={handleScroll}
      overflow="auto"
      maxHeight="100%"
      width="fit-content"
      scrollbar="hidden"
      paddingLeft="10px"
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
      {Array.from({ length: 50 }).map((_, index) => (
        <Avatar.Root size="2xl" key={index}>
          <Avatar.Fallback name="Sunny Dragons" />
          {/* <Avatar.Image src="https://bit.ly/sage-adebayo" /> */}
        </Avatar.Root>
      ))}
    </Stack>
  );
}

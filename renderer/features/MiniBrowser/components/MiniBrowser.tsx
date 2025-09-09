import { Input, Stack } from '@chakra-ui/react';
import { NavigationData } from '@main/ipc/miniBrowser';
import Titlebar from '@renderer/ui/Titlebar';
import { CSSProperties, useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaArrowRotateRight } from 'react-icons/fa6';
import MiniBrowserActionButton from './MiniBrowserActionButton';

export default function MiniBrowser() {
  const [navigationData, setNavigationData] = useState<NavigationData>({
    url: '',
    canGoBack: false,
    canGoForward: false,
  });

  useEffect(() => {
    (async () => {
      setNavigationData(await window.ipcRenderer.invoke('getInitialNavigationData'));
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = window.ipcRenderer.on('navigate', (_, navigationData) => {
      setNavigationData(navigationData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    window.ipcRenderer.invoke('loadUrl', (event.target as HTMLInputElement).value);
  };

  return (
    <Titlebar>
      <Stack
        direction="row"
        gap="3"
        height="100%"
        width="env(titlebar-area-width)"
        alignItems="center"
        paddingInline="1"
      >
        <Stack direction="row" gap="1">
          <MiniBrowserActionButton
            disabled={!navigationData.canGoBack}
            onClick={() => window.ipcRenderer.invoke('goBack')}
          >
            <FaArrowLeft />
          </MiniBrowserActionButton>
          <MiniBrowserActionButton
            disabled={!navigationData.canGoForward}
            onClick={() => window.ipcRenderer.invoke('goForward')}
          >
            <FaArrowRight />
          </MiniBrowserActionButton>
          <MiniBrowserActionButton onClick={() => window.ipcRenderer.invoke('reload')}>
            <FaArrowRotateRight />
          </MiniBrowserActionButton>
        </Stack>

        <Input
          style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}
          size="xs"
          width="96"
          marginInline="auto"
          type="url"
          value={navigationData.url}
          onChange={(e) => setNavigationData((prev) => ({ ...prev, url: e.target.value }))}
          onKeyDown={handleInputKeyDown}
        />
      </Stack>
    </Titlebar>
  );
}

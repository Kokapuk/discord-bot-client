import { Text, TextProps } from '@chakra-ui/react';
import { RefAttributes, useEffect, useState } from 'react';

export default function Versions(props: TextProps & RefAttributes<HTMLParagraphElement>) {
  const [appVersion, setAppVersion] = useState('');
  const [nodeVersion, setNodeVersion] = useState('');
  const [electronVersion, setElectronVersion] = useState('');
  const [chromeVersion, setChromeVersion] = useState('');

  useEffect(() => {
    (async () => {
      const [appVersion, nodeVersion, electronVersion, chromeVersion] = await Promise.all([
        window.ipcRenderer.invoke('getAppVersion'),
        window.ipcRenderer.invoke('getNodeVersion'),
        window.ipcRenderer.invoke('getElectronVersion'),
        window.ipcRenderer.invoke('getChromeVersion'),
      ]);

      setAppVersion(appVersion);
      setNodeVersion(nodeVersion);
      setElectronVersion(electronVersion);
      setChromeVersion(chromeVersion);
    })();
  }, []);

  return (
    <Text fontSize="xs" color="fg.subtle" {...props}>
      App: {appVersion} Node: {nodeVersion} <br />
      Electron: {electronVersion} Chrome: {chromeVersion}
    </Text>
  );
}

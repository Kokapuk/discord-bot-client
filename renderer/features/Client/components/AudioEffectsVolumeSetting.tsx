import { Settings } from '@main/utils/settingsStore';
import { Slider } from '@renderer/ui/slider';
import { useEffect, useState } from 'react';
import Setting, { SettingProps } from './Setting';
import playAudio from '@renderer/utils/playAudio';
import resolvePublicUrl from '@renderer/utils/resolvePublicUrl';
import { Text } from '@chakra-ui/react';

export default function AudioEffectsVolumeSetting(props: Partial<SettingProps>) {
  const [volume, setVolume] = useState<Settings['audioEffectsVolume']>(0.3);

  useEffect(() => {
    (async () => {
      setVolume(await window.ipcRenderer.invoke('getAudioEffectsVolume'));
    })();

    const unsubscribe = window.ipcRenderer.on('audioEffectsVolumeUpdate', (_, volume) => setVolume(volume));

    return unsubscribe;
  }, []);

  const handleChangeEnd = (value: number) => {
    window.ipcRenderer.once('audioEffectsVolumeUpdate', () => {
      playAudio(resolvePublicUrl('./audios/notification.mp3'));
    });

    window.ipcRenderer.invoke('setAudioEffectsVolume', value);
  };

  return (
    <Setting title="Audio effects volume" {...props}>
      <Slider
        min={0}
        max={1}
        step={0.01}
        value={[volume]}
        onValueChange={(e) => setVolume(e.value[0])}
        onValueChangeEnd={(e) => handleChangeEnd(e.value[0])}
        label={
          <Text fontWeight="400" fontSize="sm">
            {Math.floor(volume * 100)}%
          </Text>
        }
      />
    </Setting>
  );
}

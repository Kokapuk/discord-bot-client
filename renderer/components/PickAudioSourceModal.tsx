import { Button, CloseButton, Dialog, DialogRootProps, Portal, Stack, Text } from '@chakra-ui/react';
import { OutputAudioSource } from '@main/ipc/voice/types';
import useVoicesStore from '@renderer/stores/voice';
import { ReactNode, RefAttributes, useState } from 'react';
import { FaCircleNodes, FaSquareArrowUpRight } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import AudioOutputToggleSettingsMenu, { AudioOutputToggleSettings } from './AudioOutputToggleSettingsMenu';

const OUTPUT_AUDIO_SOURCES: Record<OutputAudioSource, { icon?: ReactNode; label: string }> = {
  systemwide: { icon: <FaCircleNodes />, label: 'Systemwide' },
  isolatedExternal: { icon: <FaSquareArrowUpRight />, label: 'Isolated external' },
  isolatedExternalWithLocalEcho: { icon: <FaSquareArrowUpRight />, label: 'Isolated external with local echo' },
};

export default function PickAudioSourceModal(props: Omit<DialogRootProps, 'children'> & RefAttributes<HTMLDivElement>) {
  const setSending = useVoicesStore(useShallow((s) => s.setSending));
  const [audioOutputSettings, setAudioOutputSettings] = useState<AudioOutputToggleSettings>(() => ({
    autoGainControl: false,
    noiseSuppression: false,
    echoCancellation: false,
  }));

  const startAudioOutput = async (outputAudioSource: OutputAudioSource) => {
    await window.ipcRenderer.invoke('startHandlingOutputAudioSource', outputAudioSource);

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: audioOutputSettings,
      video: false,
    });

    setSending(true);
    props.onOpenChange?.({ open: false });

    const audioContext = new AudioContext({ sampleRate: 48000 });
    await audioContext.audioWorklet.addModule('/pcm-processor.js');

    const source = audioContext.createMediaStreamSource(stream);
    const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');

    workletNode.port.onmessage = (event) => {
      window.ipcRenderer.invoke('voiceChunk', event.data);
    };

    source.connect(workletNode).connect(audioContext.destination);

    window.ipcRenderer.once('audioOutputHandlingStop', () => {
      source.disconnect();
      workletNode.disconnect();
      audioContext.close();
      stream.getTracks().forEach((track) => track.stop());
      setSending(false);
    });
  };

  return (
    <Dialog.Root placement="center" unmountOnExit {...props}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Pick a source you want to use as an audio output</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text marginBottom="3">System audio</Text>
              <Stack gap="3" marginBottom="5">
                {Object.entries(OUTPUT_AUDIO_SOURCES).map(([outputAudioSource, { icon, label }]) => (
                  <Button
                    key={outputAudioSource}
                    variant="subtle"
                    justifyContent="flex-start"
                    onClick={() => startAudioOutput(outputAudioSource as OutputAudioSource)}
                  >
                    {icon}
                    <Text textAlign="start" width="100%" overflow="hidden" textOverflow="ellipsis">
                      {label}
                    </Text>
                  </Button>
                ))}
              </Stack>

              {/* <Text marginBottom="3">Output device</Text> */}
            </Dialog.Body>

            <Dialog.Footer>
              <AudioOutputToggleSettingsMenu
                settings={audioOutputSettings}
                onCheckedChange={(setting, toggled) =>
                  setAudioOutputSettings((prev) => ({ ...prev, [setting]: toggled }))
                }
              />
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

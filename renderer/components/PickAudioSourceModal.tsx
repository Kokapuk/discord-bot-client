import { Button, CloseButton, Dialog, DialogRootProps, Grid, Portal, Text } from '@chakra-ui/react';
import { OutputAudioSource } from '@main/ipc/voice/types';
import useVoicesStore from '@renderer/stores/voice';
import { RefAttributes } from 'react';
import { useShallow } from 'zustand/shallow';

const OUTPUT_AUDIO_SOURCES: Record<OutputAudioSource, string> = {
  isolatedExternal: 'Isolated external',
  systemwide: 'Systemwide',
};

export default function PickAudioSourceModal(props: Omit<DialogRootProps, 'children'> & RefAttributes<HTMLDivElement>) {
  const setSending = useVoicesStore(useShallow((s) => s.setSending));

  const startAudioOutput = async (outputAudioSource: OutputAudioSource) => {
    await window.ipcRenderer.invoke('startHandlingOutputAudioSource', outputAudioSource);

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        autoGainControl: false,
        noiseSuppression: false,
        echoCancellation: false,
      },
      video: false,
    });

    setSending(true);
    props.onOpenChange?.({ open: false });

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        e.data.arrayBuffer().then((buf) => {
          window.ipcRenderer.invoke('voiceChunk', buf);
        });
      }
    };

    mediaRecorder.start(200);

    window.ipcRenderer.once('audioOutputHandlingStop', () => {
      mediaRecorder.stop();
      stream.getTracks().forEach((track) => track.stop());
      setSending(false);
    });
  };

  return (
    <Dialog.Root placement="center" size="xl" unmountOnExit {...props}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content height="90%">
            <Dialog.Header>
              <Dialog.Title>Pick source you want to use as an audio output</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Grid templateColumns="repeat(2 ,1fr)" gap="4">
                {Object.entries(OUTPUT_AUDIO_SOURCES).map(([outputAudioSource, label]) => (
                  <Button
                    key={outputAudioSource}
                    variant="subtle"
                    justifyContent="flex-start"
                    onClick={() => startAudioOutput(outputAudioSource as OutputAudioSource)}
                  >
                    <Text textAlign="start" width="100%" overflow="hidden" textOverflow="ellipsis">
                      {label}
                    </Text>
                  </Button>
                ))}
              </Grid>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

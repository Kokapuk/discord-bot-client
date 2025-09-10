import { Button, CloseButton, Dialog, IconButton, Portal, Spinner, Stack, Text } from '@chakra-ui/react';
import { OutputAudioSource } from '@main/ipc/voice/types';
import { ReactNode, RefAttributes, useEffect, useState } from 'react';
import { FaCircleNodes, FaGear, FaMicrophoneLines, FaSquareArrowUpRight } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import useVoicesStore from '../store';
import AudioToggleSettingsMenu, { AudioToggleSettings } from './AudioToggleSettingsMenu';
import resolvePublicUrl from '@renderer/utils/resolvePublicUrl';

const OUTPUT_AUDIO_SOURCES: Record<OutputAudioSource, { icon?: ReactNode; label: string }> = {
  systemwide: { icon: <FaCircleNodes />, label: 'Systemwide' },
  isolatedExternal: { icon: <FaSquareArrowUpRight />, label: 'Isolated external' },
  isolatedExternalWithLocalEcho: { icon: <FaSquareArrowUpRight />, label: 'Isolated external with local echo' },
};

export default function PickAudioSourceModal(
  props: Omit<Dialog.RootProps, 'children'> & RefAttributes<HTMLDivElement>
) {
  const setSending = useVoicesStore(useShallow((s) => s.setSending));
  const [audioOutputSettings, setAudioOutputSettings] = useState<AudioToggleSettings>(() => ({
    autoGainControl: false,
    noiseSuppression: false,
    echoCancellation: false,
  }));
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[] | null>(null);

  useEffect(() => {
    if (props.open) {
      return;
    }

    (async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioInputDevices(devices.filter((device) => device.kind === 'audioinput'));
    })();
  }, [props.open]);

  const startAudioOutput = async (stream: MediaStream) => {
    setSending(true);
    props.onOpenChange?.({ open: false });

    const audioContext = new AudioContext({ sampleRate: 48000 });
    await audioContext.audioWorklet.addModule(resolvePublicUrl('./scripts/pcm-processor.js'));

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

  const startAudioOutputWithSource = async (outputAudioSource: OutputAudioSource) => {
    await window.ipcRenderer.invoke('startHandlingOutputAudioSource', outputAudioSource);

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: { ...audioOutputSettings },
      video: false,
    });

    startAudioOutput(stream);
  };

  const startAudioOutputWithDevice = async (device: MediaDeviceInfo) => {
    await window.ipcRenderer.invoke('startHandlingOutputAudioSource');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { ...audioOutputSettings, deviceId: device.deviceId, groupId: device.groupId },
      video: false,
    });

    startAudioOutput(stream);
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
              <Text marginBottom="3">System</Text>
              <Stack gap="3" marginBottom="5">
                {Object.entries(OUTPUT_AUDIO_SOURCES).map(([outputAudioSource, { icon, label }]) => (
                  <Button
                    key={outputAudioSource}
                    variant="subtle"
                    justifyContent="flex-start"
                    onClick={() => startAudioOutputWithSource(outputAudioSource as OutputAudioSource)}
                  >
                    {icon}
                    <Text textAlign="start" width="100%" overflow="hidden" textOverflow="ellipsis">
                      {label}
                    </Text>
                  </Button>
                ))}
              </Stack>

              <Text marginBottom="3">Device</Text>
              <Stack gap="3" marginBottom="5">
                {audioInputDevices ? (
                  audioInputDevices.map((device) => (
                    <Button
                      key={device.deviceId}
                      variant="subtle"
                      justifyContent="flex-start"
                      onClick={() => startAudioOutputWithDevice(device)}
                    >
                      <FaMicrophoneLines />
                      <Text textAlign="start" width="100%" overflow="hidden" textOverflow="ellipsis">
                        {device.label}
                      </Text>
                    </Button>
                  ))
                ) : (
                  <Spinner position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" />
                )}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <AudioToggleSettingsMenu
                settings={audioOutputSettings}
                onCheckedChange={(setting, toggled) =>
                  setAudioOutputSettings((prev) => ({ ...prev, [setting]: toggled }))
                }
              >
                <IconButton variant="surface">
                  <FaGear />
                </IconButton>
              </AudioToggleSettingsMenu>
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

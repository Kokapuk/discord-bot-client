import { Button, CloseButton, Dialog, IconButton, Image, Portal, Stack, Text } from '@chakra-ui/react';
import {
  OutputAudioSource,
  OutputAudioSourceDevice,
  OutputAudioSourceLoopbackCapture,
  OutputAudioSourceType,
} from '@main/features/voice/types';
import resolvePublicUrl from '@renderer/utils/resolvePublicUrl';
import { ReactNode, RefAttributes, useEffect, useState } from 'react';
import { FaCircleNodes, FaGear, FaMicrophoneLines, FaRegWindowMaximize, FaSquareArrowUpRight } from 'react-icons/fa6';
import { useShallow } from 'zustand/shallow';
import useVoicesStore from '../store';
import AudioToggleSettingsMenu, { AudioToggleSettings } from './AudioToggleSettingsMenu';

const STATIC_SYSTEM_OUTPUT_AUDIO_SOURCES = [
  { type: OutputAudioSourceType.Systemwide, name: 'Systemwide', icon: <FaCircleNodes /> },
  { type: OutputAudioSourceType.IsolatedExternal, name: 'Isolated external', icon: <FaSquareArrowUpRight /> },
  {
    type: OutputAudioSourceType.IsolatedExternal,
    withLocalEcho: true,
    name: 'Isolated external with local echo',
    icon: <FaSquareArrowUpRight />,
  },
] as const satisfies (OutputAudioSource & { icon: ReactNode })[];

export default function PickAudioSourceModal(
  props: Omit<Dialog.RootProps, 'children'> & RefAttributes<HTMLDivElement>
) {
  const setSending = useVoicesStore(useShallow((s) => s.setSending));
  const [audioOutputSettings, setAudioOutputSettings] = useState<AudioToggleSettings>(() => ({
    autoGainControl: false,
    noiseSuppression: false,
    echoCancellation: false,
  }));
  const [windows, setWindows] = useState<OutputAudioSourceLoopbackCapture[] | null>(null);
  const [audioInputDevices, setAudioInputDevices] = useState<OutputAudioSourceDevice[] | null>(null);

  useEffect(() => {
    if (!props.open) {
      return;
    }

    (async () => {
      const response = await window.ipcRenderer.invoke('getAudioCaptureWindows');

      if (!response.success) {
        console.error('Failed to get audio capture windows:', response.error);
        setWindows([]);
        return;
      }

      setWindows(
        response.payload.map((window) => ({ type: OutputAudioSourceType.LoopbackCapture, name: window.title, window }))
      );
    })();
  }, [props.open]);

  useEffect(() => {
    if (!props.open) {
      return;
    }

    (async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioInputDevices(
        devices
          .filter((device) => device.kind === 'audioinput')
          .map((device) => ({
            type: OutputAudioSourceType.Device,
            name: device.label,
            device,
          }))
      );
    })();
  }, [props.open]);

  const startAudioOutput = async (stream: MediaStream) => {
    setSending(true);
    props.onOpenChange?.({ open: false });

    const audioContext = new AudioContext({ sampleRate: 48000 });
    await audioContext.audioWorklet.addModule(resolvePublicUrl('./scripts/pcm-processor.js'));

    const source = audioContext.createMediaStreamSource(stream);
    const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');

    const { port1, port2 } = new MessageChannel();
    window.postMessage({ type: 'port' }, '*', [port1]);
    workletNode.port.postMessage({ type: 'init', port: port2 }, [port2]);

    source.connect(workletNode).connect(audioContext.destination);

    window.ipcRenderer.once('audioOutputHandlingStop', () => {
      source.disconnect();
      workletNode.disconnect();
      port1.close();
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

  const startAudioOutputWithWindow = async (source: OutputAudioSourceLoopbackCapture) => {
    const response = await window.ipcRenderer.invoke('startHandlingOutputAudioSource', source);

    if (!response.success) {
      console.error('Failed to start capturing:', response.error);
      return;
    }

    setSending(true);
    props.onOpenChange?.({ open: false });

    window.ipcRenderer.once('audioOutputHandlingStop', () => {
      setSending(false);
    });
  };

  const startAudioOutputWithDevice = async (source: OutputAudioSourceDevice) => {
    await window.ipcRenderer.invoke('startHandlingOutputAudioSource');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { ...audioOutputSettings, deviceId: source.device.deviceId, groupId: source.device.groupId },
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
            <Dialog.Body maxHeight="70vh" overflow="auto">
              <Text marginBottom="3">System</Text>
              <Stack gap="3" marginBottom="5">
                {STATIC_SYSTEM_OUTPUT_AUDIO_SOURCES.map((source) => (
                  <Button
                    key={source.type}
                    variant="subtle"
                    justifyContent="flex-start"
                    onClick={() => startAudioOutputWithSource(source)}
                  >
                    {source.icon}
                    <Text textAlign="start" width="100%" overflow="hidden" textOverflow="ellipsis">
                      {source.name}
                    </Text>
                  </Button>
                ))}
                {windows?.map((source) => (
                  <Button
                    key={source.window.processId}
                    variant="subtle"
                    justifyContent="flex-start"
                    onClick={() => startAudioOutputWithWindow(source)}
                  >
                    {source.window.icon ? (
                      <Image src={source.window.icon} width="5" height="5" />
                    ) : (
                      <FaRegWindowMaximize />
                    )}
                    <Text textAlign="start" width="100%" overflow="hidden" textOverflow="ellipsis">
                      {source.name}
                    </Text>
                  </Button>
                ))}
              </Stack>

              <Text marginBottom="3">Device</Text>
              <Stack gap="3" marginBottom="5">
                {audioInputDevices?.map((source) => (
                  <Button
                    key={source.device.deviceId}
                    variant="subtle"
                    justifyContent="flex-start"
                    onClick={() => startAudioOutputWithDevice(source)}
                  >
                    <FaMicrophoneLines />
                    <Text textAlign="start" width="100%" overflow="hidden" textOverflow="ellipsis">
                      {source.name}
                    </Text>
                  </Button>
                ))}
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

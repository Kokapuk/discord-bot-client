import { Button, CloseButton, Dialog, IconButton, Image, Portal, Stack, Text } from '@chakra-ui/react';
import {
  OutputAudioSource,
  OutputAudioSourceDevice,
  OutputAudioSourceLoopbackCapture,
  OutputAudioSourceType,
  VoiceConnectionStatus,
} from '@main/features/voice/types';
import playAudio from '@renderer/utils/playAudio';
import resolvePublicUrl from '@renderer/utils/resolvePublicUrl';
import omit from 'lodash/omit';
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
  const { setSending, setActiveOutputAudioSource } = useVoicesStore(
    useShallow((s) => ({ setSending: s.setSending, setActiveOutputAudioSource: s.setActiveOutputAudioSource }))
  );
  const [audioOutputSettings, setAudioOutputSettings] = useState<AudioToggleSettings>(() => ({
    autoGainControl: false,
    noiseSuppression: false,
    echoCancellation: false,
  }));
  const [windows, setWindows] = useState<OutputAudioSourceLoopbackCapture[] | null>(null);
  const [audioInputDevices, setAudioInputDevices] = useState<OutputAudioSourceDevice[] | null>(null);

  const setSendingWithAudioEffect = (sending: boolean) => {
    setSending(sending);

    if (sending) {
      playAudio(resolvePublicUrl('./audios/unmute.mp3'));
    } else {
      playAudio(resolvePublicUrl('./audios/mute.mp3'));
    }
  };

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
        response.payload.map((window) => ({
          type: OutputAudioSourceType.LoopbackCapture,
          name: window.processName.replace('.exe', ''),
          window,
        }))
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

  const startAudioOutput = async (stream: MediaStream, outputAudioSource: OutputAudioSource) => {
    setSendingWithAudioEffect(true);
    setActiveOutputAudioSource(outputAudioSource);
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
      setSendingWithAudioEffect(false);
      setActiveOutputAudioSource(null);
    });
  };

  const startAudioOutputWithSource = async (source: OutputAudioSource) => {
    await window.ipcRenderer.invoke('startHandlingOutputAudioSource', source);

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: { ...audioOutputSettings },
      video: false,
    });

    startAudioOutput(stream, source);
  };

  const startAudioOutputWithWindow = async (source: OutputAudioSourceLoopbackCapture) => {
    const response = await window.ipcRenderer.invoke('startHandlingOutputAudioSource', source);

    if (!response.success) {
      console.error('Failed to start capturing:', response.error);
      return;
    }

    setSendingWithAudioEffect(true);
    setActiveOutputAudioSource(source);
    props.onOpenChange?.({ open: false });

    window.ipcRenderer.once('audioOutputHandlingStop', () => {
      if (useVoicesStore.getState().connectionStatus === VoiceConnectionStatus.Destroyed) {
        setSending(false);
      } else {
        setSendingWithAudioEffect(false);
      }

      setActiveOutputAudioSource(null);
    });
  };

  const startAudioOutputWithDevice = async (source: OutputAudioSourceDevice) => {
    await window.ipcRenderer.invoke('startHandlingOutputAudioSource');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { ...audioOutputSettings, deviceId: source.device.deviceId, groupId: source.device.groupId },
      video: false,
    });

    startAudioOutput(stream, source);
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
                    key={source.name}
                    variant="subtle"
                    justifyContent="flex-start"
                    onClick={() => startAudioOutputWithSource(omit(source, 'icon'))}
                  >
                    {source.icon}
                    <Text textAlign="start" width="100%" overflow="hidden" textOverflow="ellipsis">
                      {source.name}
                    </Text>
                  </Button>
                ))}
                {windows?.map((source, index) => (
                  <Button
                    key={index}
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
                      {source.window.title}
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

import { Button, CloseButton, Dialog, DialogRootProps, Grid, Image, Portal, Spinner, Text } from '@chakra-ui/react';
import { AudioSource } from '@main/api/voice/types';
import { ipcRendererApiFunctions } from '@renderer/api';
import { RefAttributes, useEffect, useState } from 'react';

export default function PickAudioSourceModal(props: Omit<DialogRootProps, 'children'> & RefAttributes<HTMLDivElement>) {
  const [sources, setSources] = useState<AudioSource[] | null>(null);

  useEffect(() => {
    if (!props.open) {
      return;
    }

    (async () => {
      setSources(null);

      const response = await ipcRendererApiFunctions.getAudioSources();

      if (!response.success) {
        console.error('Failed to get sources:', response.error);
        return;
      }

      setSources(response.payload);
    })();
  }, [props.open]);

  return (
    <Dialog.Root placement="center" size="xl" unmountOnExit {...props}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content height="90%">
            <Dialog.Header>
              <Dialog.Title>Pick source you want to use as audio output</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {!sources ? (
                <Spinner
                  color="colorPalette.fg"
                  position="absolute"
                  left="50%"
                  top="50%"
                  transform="translate(-50%, -50%)"
                />
              ) : (
                <Grid templateColumns="repeat(2 ,1fr)" gap="4">
                  {sources.map((source) => (
                    <Button
                      key={source.type === 'window' ? source.windowId : 'TODO'}
                      variant="subtle"
                      justifyContent="flex-start"
                    >
                      {source.type === 'window' && <Image height="5" width="5" src={source.appIconDataUrl} />}
                      <Text textAlign="start" width="100%" overflow="hidden" textOverflow="ellipsis">
                        {source.name}
                      </Text>
                    </Button>
                  ))}
                </Grid>
              )}
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

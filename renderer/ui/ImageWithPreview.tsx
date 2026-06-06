import { CloseButton, Dialog, Image, type ImageProps, Portal } from '@chakra-ui/react';
import { RefAttributes, useCallback, useState } from 'react';

export type ImageWithPreviewProps = ImageProps & RefAttributes<HTMLImageElement>;

export default function ImageWithPreview({ ref, src, alt, ...props }: ImageWithPreviewProps) {
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState('50% 50%');

  const handleOpenChange = useCallback((details: { open: boolean }) => {
    if (!details.open) {
      setScale(1);
      setOrigin('50% 50%');
    }
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLImageElement>) => {
    event.preventDefault();
    const target = event.currentTarget;

    setScale((prev) => {
      const step = event.deltaY < 0 ? 0.2 : -0.2;
      const next = Math.min(3, Math.max(1, Number((prev + step).toFixed(2))));

      if (next !== prev) {
        const rect = target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        const clampedX = Math.min(100, Math.max(0, x));
        const clampedY = Math.min(100, Math.max(0, y));
        setOrigin(`${clampedX}% ${clampedY}%`);
      }

      return next;
    });
  }, []);

  return (
    <Dialog.Root placement="center" motionPreset="scale" onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Image ref={ref} cursor="pointer" {...props} />
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner overflow="hidden" w="full">
          <Dialog.Content
            bg="transparent"
            boxShadow="none"
            w="full"
            h="full"
            maxW="full"
            margin={0}
          >
            <Dialog.CloseTrigger asChild position="absolute" top="16" right="16">
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Body
              p="0"
              display="flex"
              alignItems="center"
              justifyContent="center"
              minH="90vh"
            >
              <Image
                src={src}
                alt={alt}
                maxW="95vw"
                maxH="90vh"
                fit="contain"
                onWheel={handleWheel}
                transform={`scale(${scale})`}
                transformOrigin={origin}
                transition="all 150ms"
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

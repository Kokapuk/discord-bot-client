import { Box, BoxProps } from '@chakra-ui/react';
import { memo, useEffect, useMemo, useRef } from 'react';

export type OutputAudioVisualizerBaseProps = {
  barsCount?: number;
  barWidth?: number;
  barsGap?: number;
  height?: number;
  highestLevelMultiplier?: number;
  lowestLevelMultiplier?: number;
};

export type OutputAudioVisualizerProps = OutputAudioVisualizerBaseProps & Omit<BoxProps, 'height'>;

const OutputAudioVisualizer = ({
  barsCount = 3,
  barWidth = 3,
  barsGap = 2,
  height = 15,
  highestLevelMultiplier = 3,
  lowestLevelMultiplier = 1,
  ...props
}: OutputAudioVisualizerProps) => {
  const canvasContext = useRef<CanvasRenderingContext2D | null | undefined>(null);

  const levelMultipliers = useMemo(() => {
    const step = (highestLevelMultiplier - lowestLevelMultiplier) / (barsCount - 1);

    return Array.from({ length: barsCount })
      .map((_, index) => {
        if (index === 0) {
          return lowestLevelMultiplier;
        }

        if (index === barsCount - 1) {
          return highestLevelMultiplier;
        }

        return lowestLevelMultiplier + step * index;
      })
      .reverse();
  }, []);

  const computedColor = useRef('white');

  useEffect(() => {
    const canvas = canvasContext.current?.canvas;

    if (!canvas) {
      return;
    }

    computedColor.current = getComputedStyle(canvas).color;
  }, [props.color]);

  const updateBars = (level: number) => {
    if (!canvasContext.current) {
      return;
    }

    const ctx = canvasContext.current;
    const canvas = ctx.canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < barsCount; ++i) {
      ctx.fillStyle = computedColor.current;
      const barHeight = level * levelMultipliers[i] * canvas.height;
      ctx.fillRect(i * (barWidth + barsGap), canvas.height - barHeight, barWidth, barHeight);
    }
  };

  useEffect(() => {
    const unsubscribe = window.ipcRenderer.on('outputAudioChunkProcessed', (_, chunk) => {
      let sum = 0;

      for (let i = 0; i < chunk.length; i += 2) {
        const left = chunk[i] - 128;
        const right = chunk[i + 1] - 128;

        sum += (Math.abs(left) + Math.abs(right)) / 2;
      }

      const avg = sum / (chunk.length / 2);
      const normalized = 1 - avg / 128;

      updateBars(normalized);
    });

    return unsubscribe;
  }, []);

  return (
    <Box
      ref={(canvas: HTMLCanvasElement | null) => (canvasContext.current = canvas?.getContext('2d'))}
      as="canvas"
      // outline="2px solid red"
      htmlWidth={barsCount * (barWidth + barsGap) - barsGap}
      htmlHeight={height}
      width={`${barsCount * (barWidth + barsGap) - barsGap}px`}
      height={`${height}px`}
      {...props}
    />
  );
};

export default memo(OutputAudioVisualizer);

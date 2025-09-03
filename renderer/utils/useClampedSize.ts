export type UseClampedSizeOptions = { width: number; height: number; maxSize: number };

const useClampedSize = ({ width, height, maxSize }: UseClampedSizeOptions) => {
  if (width === null || height === null) {
    return [0, 0];
  }

  const biggerAxis = width > height ? 'width' : 'height';

  if (biggerAxis === 'width') {
    const clampedWidth = Math.min(width, maxSize);
    const clampedHeight = clampedWidth * (height / width);
    return [clampedWidth, clampedHeight];
  } else {
    const clampedHeight = Math.min(height, maxSize);
    const clampedWidth = clampedHeight * (width / height);
    return [clampedWidth, clampedHeight];
  }
};

export default useClampedSize;

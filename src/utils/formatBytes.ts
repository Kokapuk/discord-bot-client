const SIZES = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

const formatBytes = (bytes: number) => {
  if (bytes === 0) {
    return 'n/a';
  }

  const sizeIndex = Math.floor(Math.log(bytes) / Math.log(1024));

  if (sizeIndex == 0) {
    return bytes + ' ' + SIZES[sizeIndex];
  }

  return (bytes / Math.pow(1024, sizeIndex)).toFixed(1) + ' ' + SIZES[sizeIndex];
};

export default formatBytes;

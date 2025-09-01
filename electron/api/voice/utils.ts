import { DesktopCapturerSource } from 'electron';
import { AudioSource } from './types';

export const structAudioSource = (source: DesktopCapturerSource): AudioSource => ({
  name: source.name,
  windowId: source.id,
  appIconDataUrl: source.appIcon.toDataURL(),
  type: 'window',
});

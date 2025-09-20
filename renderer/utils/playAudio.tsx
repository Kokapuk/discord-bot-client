import useClientStore from '@renderer/features/Client/store';

const playAudio = (src: string) => {
  const audio = new Audio(src);
  audio.volume = useClientStore.getState().audioEffectsVolume;
  audio.play();
};

export default playAudio;

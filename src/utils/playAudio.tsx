const playAudio = (src: string) => {
  const audio = new Audio(src);
  audio.volume = 0.3;
  audio.play();
};

export default playAudio;

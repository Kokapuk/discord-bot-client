const resolvePublicUrl = (url: string) => {
  return new URL(url, window.location.href).href;
};

export default resolvePublicUrl;

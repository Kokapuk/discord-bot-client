import { MainToRendererChannel } from '@main/preload';

const handleIpcRendererAutoInvokeEvents = (events: MainToRendererChannel[], callback: () => void) => {
  const unsubscribes = events.map((event) => window.ipcRenderer.on(event, callback));

  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
};

export default handleIpcRendererAutoInvokeEvents;

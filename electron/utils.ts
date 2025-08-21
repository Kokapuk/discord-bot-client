import { IpcMainInvokeEvent } from 'electron';

export type StripIpcMainInvokeEventArgs<T extends Record<string, (...args: any) => any>> = {
  [K in keyof T]: T[K] extends (event: IpcMainInvokeEvent, ...args: infer Rest) => infer Ret
    ? (...args: Rest) => Ret
    : T[K];
};

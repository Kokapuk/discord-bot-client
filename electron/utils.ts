import { IpcMainInvokeEvent } from 'electron';

export type IpcMainEventHandlersToRendererFunctions<T extends Record<string, (...args: any) => any>> = {
  [K in keyof T]: T[K] extends (event: IpcMainInvokeEvent, ...args: infer Rest) => infer Ret
    ? (...args: Rest) => Promise<Ret>
    : T[K] extends (...args: infer Args) => infer Ret
    ? (...args: Args) => Promise<Ret>
    : never;
};

export type IpcSlice = {
  rendererToMain?: Record<string, (...args: any) => Promise<any>>;
  mainToRenderer?: Record<string, (...args: any) => void>;
};

export type CreateIpcSlice<T extends IpcSlice> = T;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type MergeSlices<T extends IpcSlice> = {
  rendererToMain: UnionToIntersection<
    T extends { rendererToMain: IpcSlice['rendererToMain'] } ? T['rendererToMain'] : never
  >;
  mainToRenderer: UnionToIntersection<
    T extends { mainToRenderer: IpcSlice['mainToRenderer'] } ? T['mainToRenderer'] : never
  >;
};

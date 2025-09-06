import { contextBridge } from 'electron';
import { AppIpcSlice } from './ipc/app';
import { ClientIpcSlice } from './ipc/client';
import { GuildsIpcSlice } from './ipc/guilds';
import { MessagesIpcSlice } from './ipc/messages';
import { MiniBrowserIpcSlice } from './ipc/miniBrowser';
import { VoiceIpcSlice } from './ipc/voice';
import { createIpcRenderer } from './utils/createIpcRenderer';
import { MergeSlices } from './utils/ipc';

type MergedSlices = MergeSlices<
  AppIpcSlice | ClientIpcSlice | GuildsIpcSlice | MessagesIpcSlice | VoiceIpcSlice | MiniBrowserIpcSlice
>;

const ipcRenderer = createIpcRenderer<MergedSlices>();

export type IpcRenderer = typeof ipcRenderer;
export type MainToRendererChannel = keyof MergeSlices<MergedSlices>['mainToRenderer'];

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

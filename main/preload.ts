import { contextBridge } from 'electron';
import { AppIpcSlice } from './ipc/app';
import { ClientIpcSlice } from './ipc/client';
import { GuildsIpcSlice } from './ipc/guilds';
import { MessagesIpcSlice } from './ipc/messages';
import { VoiceIpcSlice } from './ipc/voice';
import { createIpcRenderer } from './utils/createIpcRenderer';
import { MergeSlices } from './utils/ipc';

const ipcRenderer =
  createIpcRenderer<MergeSlices<AppIpcSlice | ClientIpcSlice | GuildsIpcSlice | MessagesIpcSlice | VoiceIpcSlice>>();

export type IpcRenderer = typeof ipcRenderer;
export type MainToRendererChannel = keyof MergeSlices<
  AppIpcSlice | ClientIpcSlice | GuildsIpcSlice | MessagesIpcSlice | VoiceIpcSlice
>['mainToRenderer'];

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

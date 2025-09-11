import { contextBridge } from 'electron';
import { ClientIpcSlice } from './ipc/client';
import { DmsIpcSlice } from './ipc/dms';
import { GuildsIpcSlice } from './ipc/guilds';
import { MessagesIpcSlice } from './ipc/messages';
import { MiniBrowserIpcSlice } from './ipc/miniBrowser';
import { SettingsIpcSlice } from './ipc/settings';
import { VoiceIpcSlice } from './ipc/voice';
import { createIpcRenderer } from './utils/createIpcRenderer';
import { MergeSlices } from './utils/ipc';

type MergedSlices = MergeSlices<
  | ClientIpcSlice
  | GuildsIpcSlice
  | MessagesIpcSlice
  | VoiceIpcSlice
  | MiniBrowserIpcSlice
  | SettingsIpcSlice
  | DmsIpcSlice
>;

const ipcRenderer = createIpcRenderer<MergedSlices>();

export type IpcRenderer = typeof ipcRenderer;
export type MainToRendererChannel = keyof MergeSlices<MergedSlices>['mainToRenderer'];

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

import { IpcApiResponse } from '..';
import { CreateIpcSlice } from '../../utils/ipc';
import { AudioSource, VoiceConnectionStatus, VoiceMember, VoiceState } from './types';

export type VoiceIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    getGuildsVoiceChannelsMembers: () => Promise<IpcApiResponse<Record<string, Record<string, VoiceMember[]>>>>;
    enableReceiver: () => Promise<void>;
    disableReceiver: () => Promise<void>;
    joinVoice: (guildId: string, channelId: string) => Promise<void>;
    leaveVoice: () => Promise<void>;
    getAudioSources: () => Promise<IpcApiResponse<AudioSource[]>>;
    // voiceChunk: (buffer: ArrayBuffer) => Promise<void>;
  };
  mainToRenderer: {
    voiceStateUpdate: (oldState: VoiceState, newState: VoiceState) => void;

    voiceConnectionStatusUpdate: (
      status: VoiceConnectionStatus,
      activeChannel: { guildId: string; channelId: string }
    ) => void;
  };
}>;

import { IpcApiResponse } from '..';
import { CreateIpcSlice } from '../../utils/ipc';
import { OutputAudioSource, VoiceConnectionStatus, VoiceMember, VoiceState } from '../../features/voice/types';

export type VoiceIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    getGuildsVoiceChannelsMembers: () => Promise<IpcApiResponse<Record<string, Record<string, VoiceMember[]>>>>;
    enableReceiver: () => Promise<void>;
    disableReceiver: () => Promise<void>;
    joinVoice: (guildId: string, channelId: string) => Promise<void>;
    leaveVoice: () => Promise<void>;
    startHandlingOutputAudioSource: (source?: OutputAudioSource) => Promise<void>;
    stopHandlingOutputAudioSource: () => Promise<void>;
    voiceChunk: (buffer: ArrayBuffer) => Promise<void>;
    getUserVolume: (userId: string) => Promise<number>;
    setUserVolume: (userId: string, volume: number) => Promise<void>;
  };
  mainToRenderer: {
    voiceStateUpdate: (oldState: VoiceState, newState: VoiceState) => void;

    voiceConnectionStatusUpdate: (
      status: VoiceConnectionStatus,
      activeChannel: { guildId: string; channelId: string }
    ) => void;

    audioOutputHandlingStop: () => void;
    userSpeakingStart: (userId: string) => void;
    userSpeakingEnd: (userId: string) => void;
  };
}>;

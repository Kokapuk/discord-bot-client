import { IpcApiResponse } from '..';
import {
  OutputAudioSource,
  OutputAudioWindowSource,
  VoiceConnectionStatus,
  VoiceMember,
  VoiceState,
} from '../../features/voice/types';
import { CreateIpcSlice } from '../../utils/ipc';

export type VoiceIpcSlice = CreateIpcSlice<{
  rendererToMain: {
    getGuildsVoiceChannelsMembers: () => Promise<IpcApiResponse<Record<string, Record<string, VoiceMember[]>>>>;
    enableReceiver: () => Promise<void>;
    disableReceiver: () => Promise<void>;
    joinVoice: (guildId: string, channelId: string) => Promise<void>;
    leaveVoice: () => Promise<void>;
    getAudioCaptureWindows: () => Promise<IpcApiResponse<OutputAudioWindowSource[]>>;
    startHandlingOutputAudioSource: (source?: OutputAudioSource, processId?: string) => Promise<void>;
    sendAudioPort: () => Promise<void>;
    stopHandlingOutputAudioSource: () => Promise<void>;
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

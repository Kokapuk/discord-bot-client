import { VoiceMember } from '@main/features/voice/types';
import { createContext } from 'use-context-selector';

export type VoiceContext = {
  voiceMembers?: Record<string, Record<string, VoiceMember[] | null | undefined> | null | undefined>;
  speakingMemberIds?: string[];
};

export const VoiceContext = createContext<VoiceContext | null>(null);

import { VoiceMember } from '@main/features/voice/types';
import { createContext, useContext } from 'react';

export type VoiceContext = {
  voiceMembers?: Record<string, Record<string, VoiceMember[] | null | undefined> | null | undefined>;
  speakingMemberIds?: string[];
};

const VoiceContext = createContext<VoiceContext | null>(null);

export const useVoiceContext = () => {
  const ctx = useContext(VoiceContext);

  if (!ctx) {
    throw Error('useVoiceContext must be used inside ChannelProvider');
  }

  return ctx;
};

export const VoiceProvider = VoiceContext.Provider;

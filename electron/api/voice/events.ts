import { VoiceConnection } from '@discordjs/voice';
import { WebContents } from 'electron';

export const bindIpcVoiceApiEvents = (
  connection: VoiceConnection,
  webContents: WebContents,
  activeChannel: { guildId: string; channelId: string }
) => {
  connection.on('stateChange', (_, state) =>
    webContents.send('voiceConnectionStatusUpdate', state.status, activeChannel)
  );
};

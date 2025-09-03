export type Status = 'online' | 'idle' | 'dnd' | 'invisible' | 'offline';

export interface User {
  id: string;
  displayName: string;
  displayAvatarUrl: string;
  status?: Status;
}

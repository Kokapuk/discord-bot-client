export type Status = 'online' | 'idle' | 'dnd' | 'invisible' | 'offline';

export interface User {
  id: string;
  username: string;
  displayName: string;
  displayAvatarUrl: string;
  status?: Status;
}

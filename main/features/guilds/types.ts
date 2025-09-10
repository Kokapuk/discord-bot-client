import { User } from '../users/types';

export interface Guild {
  id: string;
  name: string;
  iconUrl: string | null;
}

export interface GuildMember extends User {
  displayHexColor?: `#${string}`;
}

export interface Role {
  id: string;
  name: string;
  hexColor: `#${string}`;
}

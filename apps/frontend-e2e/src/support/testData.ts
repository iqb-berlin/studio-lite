export interface WsData {
  id: string;
  name: string;
}

export interface GroupData {
  id: string;
  name: string;
}

export interface UnitData {
  shortname: string;
  name: string;
  group: string;
}

export interface UserData {
  username: string;
  password: string;
  isAdmin?: boolean;
  description?: string | '';
  email?: string;
  lastName?: string;
  firstName?: string;
  issuer?: string;
  identity?: string;
}

export enum AccessLevel {Basic, Developer, Admin}

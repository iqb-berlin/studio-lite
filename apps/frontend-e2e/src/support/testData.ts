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
}

export enum AccessLevel {Basic, Developer, Manager, Admin}

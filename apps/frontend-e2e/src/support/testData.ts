export interface WsData {
  id: string;
  name: string;
  state?: string[];
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

export interface InterceptData {
  operation: Operation;
  name: string;
  url: string;
  status: string;
  headers: string;
  body: string;
}

export enum AccessLevel {Basic = 1, Developer = 2, Admin = 4}
export enum Operation { GET, POST, PATCH, DELETE }

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

export interface WsSettings {
  defaultEditor?: string;
  defaultPlayer?: string;
  defaultSchemer?: string;
  unitGroups?: string[];
  stableModulesOnly?: boolean;
  unitMDProfile?: string;
  itemMDProfile?: string;
  states?: string[];
  groupName?: string;
  id?: number;
}

export interface DownloadSettings {
  unitList: number[];
  addPlayers: boolean;
  addTestTakersReview: number;
  addTestTakersMonitor: number;
  addTestTakersHot:number;
  passwordLess: boolean;
  bookletSettings:string[];
}
// export interface MetaValue {
//   name: string,
//   value: string
// }

export interface CommentData {
  body?: string;
  userName?: string;
  userId?: number;
  parentId?: number;
  unitId?: number;
  lastSeenCommentChangedAt?: string;
}

export interface ReviewData {
  id: number;
  link: string;
  name: string;
  password?: string;
  settings?: string;
  units?: number[]
}

export interface MyData {
  id: string;
  description: string;
  email: string;
  lastName: string;
  firstName: string;
  emailPublishApproved: boolean;
}

export interface MetadataType {
  id: string,
  editor?: string,
  player?: string,
  schemer?: string,
}
// export interface ProfileData {
//   profile: string;
//   label: string;
// }

export enum AccessLevel {Basic = 1, Developer = 2, Admin = 4}
export enum Operation { GET, POST, PATCH, DELETE }

export interface AccessUser {
  id: string;
  access: AccessLevel;
}

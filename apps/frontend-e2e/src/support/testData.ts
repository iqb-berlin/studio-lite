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

export interface WsSettings {
  defaultEditor?: string;
  defaultPlayer?: string;
  defaultSchemer?: string;
  unitGroups?: string[];
  stableModulesOnly?: boolean;
  unitMDProfile?: string;
  itemMDProfile?: string;
  states?: string[];
}

export interface CommentData {
  body?: string;
  userName?: string;
  userId?: number;
  parentId?: number;
  unitId?: number;
  lastSeenCommentChangedAt?: Date;
}

export interface ReviewData {
  id: number;
  link: string;
  name: string;
  password?: string;
  settings?: string;
  units?: number[];
}

export interface MyData {
  id: string;
  description: string;
  email: string;
  lastName: string;
  firstName: string;
  emailPublishApproved: boolean;
}

export interface CopyUnit {
  createForm: number;
  groupName: string;
  key: string;
  name: string;
}

export interface DefinitionUnit {
  id: number;
  key?: string;
  groupName?: string;
  state?: string;
  variables?: string[];
}

export interface UnitExport {
  unitXsdUrl: string;
  bookletXsdUrl: string;
  testTakersXsdUrl: string;
}

export enum AccessLevel {Basic = 1, Developer = 2, Admin = 4}

export interface AccessUser {
  id: string;
  access: AccessLevel;
}

export const resource = 'GeoGebra.itcr.zip';
export const modules:string[] = [
  'iqb-schemer-2.5.3.html',
  'iqb-editor-aspect-2.9.4.html',
  'iqb-player-aspect-2.9.4.html'];

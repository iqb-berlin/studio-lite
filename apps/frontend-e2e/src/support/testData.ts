/**
 * Workspace data structure
 */
export interface WsData {
  /** Workspace ID */
  id: string;
  /** Workspace name */
  name: string;
  /** Optional workspace states */
  state?: string[];
}

/**
 * Workspace group data structure
 */
export interface GroupData {
  /** Group ID */
  id: string;
  /** Group name */
  name: string;
}

/**
 * Unit data structure
 */
export interface UnitData {
  /** Short name/key of the unit */
  shortname: string;
  /** Full name of the unit */
  name: string;
  /** Group the unit belongs to */
  group: string;
}

/**
 * User data structure
 */
export interface UserData {
  /** Username for login */
  username: string;
  /** User password */
  password: string;
  /** Whether user has admin privileges */
  isAdmin?: boolean;
  /** User description */
  description?: string | '';
  /** User email address */
  email?: string;
  /** User last name */
  lastName?: string;
  /** User first name */
  firstName?: string;
  /** Identity provider issuer */
  issuer?: string;
  /** User identity */
  identity?: string;
}

/**
 * Workspace settings structure
 */
export interface WsSettings {
  /** Default editor module */
  defaultEditor?: string;
  /** Default player module */
  defaultPlayer?: string;
  /** Default schemer module */
  defaultSchemer?: string;
  /** Unit groups */
  unitGroups?: string[];
  /** Whether to use only stable modules */
  stableModulesOnly?: boolean;
  /** Unit metadata profile */
  unitMDProfile?: string;
  /** Item metadata profile */
  itemMDProfile?: string;
  /** Workspace states */
  states?: string[];
}

/**
 * Comment data structure
 */
export interface CommentData {
  /** Comment body text */
  body?: string;
  /** Username of commenter */
  userName?: string;
  /** User ID of commenter */
  userId?: number;
  /** Parent comment ID for replies */
  parentId?: number;
  /** Unit ID the comment belongs to */
  unitId?: number;
  /** Last seen comment timestamp */
  lastSeenCommentChangedAt?: Date;
}

/**
 * Review data structure
 */
export interface ReviewData {
  /** Review ID */
  id: number;
  /** Review link */
  link: string;
  /** Review name */
  name: string;
  /** Review password */
  password?: string;
  /** Review settings */
  settings?: string;
  /** Units included in review */
  units?: number[];
}

/**
 * User personal data structure
 */
export interface MyData {
  /** User ID */
  id: string;
  /** User description */
  description: string;
  /** User email */
  email: string;
  /** User last name */
  lastName: string;
  /** User first name */
  firstName: string;
  /** Email publish approval status */
  emailPublishApproved: boolean;
}

/**
 * Copy unit data structure
 */
export interface CopyUnit {
  /** Create form type */
  createForm: number;
  /** Group name */
  groupName: string;
  /** Unit key */
  key: string;
  /** Unit name */
  name: string;
}

/**
 * Unit definition structure
 */
export interface DefinitionUnit {
  /** Unit ID */
  id: number;
  /** Unit key */
  key?: string;
  /** Group name */
  groupName?: string;
  /** Unit state */
  state?: string;
  /** Variables in the unit */
  variables?: string[];
}

/**
 * Unit export structure
 */
export interface UnitExport {
  /** Unit XSD URL */
  unitXsdUrl: string;
  /** Booklet XSD URL */
  bookletXsdUrl: string;
  /** Test takers XSD URL */
  testTakersXsdUrl: string;
}

/**
 * Access level enumeration
 */
export enum AccessLevel {
  /** Basic access level */
  Basic = 1,
  /** Developer access level */
  Developer = 2,
  /** Admin access level */
  Admin = 4
}

/**
 * User access structure
 */
export interface AccessUser {
  /** User ID */
  id: string;
  /** Access level */
  access: AccessLevel;
}

// =============================================================================
// Common Test Resources
// =============================================================================

/**
 * Resource package for testing
 */
export const resource = 'GeoGebra.itcr.zip';

/**
 * Verona modules for testing
 */
export const modules: string[] = [
  'iqb-schemer-2.6.0.html',
  'iqb-editor-aspect-2.12.1.html',
  'iqb-editor-speedtest-3.2.0.html',
  'iqb-player-aspect-2.12.1.html',
  'iqb-player-speedtest-3.3.0.html',
  'iqb-player-stars-0.6.26.html'
];

// =============================================================================
// Centralized Test Data
// =============================================================================

/**
 * Common workspace group names used across tests
 */
export const testGroups = {
  /** Basic group used in shared test setup */
  basic: 'Grundgruppe',
  /** Admin test group */
  admin: 'Mathematik Primär Bereichsgruppe',
  /** Metadata test groups */
  metadata: {
    bista1: 'Bista I',
    bista3: 'Bista III',
    math: 'Mathematik Primär und Sek I',
    german: 'Deutsch Primär und Sek I'
  }
} as const;

/**
 * Common workspace names used across tests
 */
export const testWorkspaces = {
  /** Basic workspace used in shared test setup */
  basic: {
    initial: 'Grundarbeitsbereich',
    final: 'Endgültiger Arbeitsbereich'
  },
  /** Admin test workspaces */
  admin: {
    math1: 'Mathematik I',
    german1: 'Deutsch I'
  },
  /** Metadata test workspaces */
  metadata: {
    german1: 'Deutsch I',
    math1: 'Mathematik I',
    mathPrimar1: 'Mathematik Primar I',
    math2: 'Mathematik II'
  }
} as const;

/**
 * Common user definitions for testing
 */
export const testUsers = {
  /** Normal user without admin privileges */
  normal: {
    username: 'normaluser',
    password: '5678',
    lastName: '',
    firstName: '',
    email: 'no-mail',
    isAdmin: false
  } as UserData,

  /** Another normal user for multi-user tests */
  another: {
    username: 'anotheruser',
    password: '5678',
    lastName: '',
    firstName: '',
    email: 'no-mail-2',
    isAdmin: false
  } as UserData,

  /** Group admin user */
  groupAdmin: {
    username: 'groupadminuser',
    password: '1111',
    isAdmin: false
  } as UserData
} as const;

// Legacy exports for backward compatibility
export const group1: string = testGroups.basic;
export const ws1: string = testWorkspaces.basic.initial;
export const ws2: string = testWorkspaces.basic.final;
export const newUser: UserData = testUsers.normal;
export const anotherUser: UserData = testUsers.another;

/**
 * Common unit definition for imported test units
 */
export const importedUnit: UnitData = {
  shortname: 'M6_AK0011',
  name: '',
  group: ''
};

export const lightUnit: UnitData = {
  shortname: 'M6_AK0013',
  name: '',
  group: ''
};

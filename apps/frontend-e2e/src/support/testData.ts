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
  'iqb-schemer-2.8.4.html',
  'iqb-editor-aspect-3.0.0.html',
  'iqb-editor-speedtest-3.2.0.html',
  'iqb-player-aspect-3.0.0.html',
  'iqb-player-speedtest-3.3.0.html',
  'iqb-player-stars-0.6.26.html'
];

/**
 * Widgets for testing
 */
export const widgets: string[] = [
  'molecule-editor-widget-0.2.0.html',
  'periodic-system-select-widget-0.2.0.html'
];

// =============================================================================
// Workspace Groups
// =============================================================================

/** Base workspace group – used by the shared test setup and most workspace tests */
export const baseGroup = 'Grundgruppe';
/** Admin management test group */
export const adminGroup = 'Mathematik Primär Bereichsgruppe';
/** Metadata test group – Bista I */
export const metadataBistaIGroup = 'Bista I';
/** Metadata test group – Bista III */
export const metadataBistaIIIGroup = 'Bista III';
/** Metadata test group – Mathematik Primär und Sek I */
export const metadataMathGroup = 'Mathematik Primär und Sek I';
/** Metadata test group – Deutsch Primär und Sek I */
export const metadataGermanGroup = 'Deutsch Primär und Sek I';

// =============================================================================
// Workspaces
// =============================================================================

/** Primary workspace – created in the shared base setup */
export const primaryWorkspace = 'Grundarbeitsbereich';
/** Secondary workspace – second workspace in the shared base setup */
export const secondaryWorkspace = 'Endgültiger Arbeitsbereich';
/** Admin test workspace – Mathematik I */
export const adminMathWorkspace = 'Mathematik I';
/** Admin test workspace – Deutsch I */
export const adminGermanWorkspace = 'Deutsch I';
/** Metadata workspace – Deutsch I */
export const metadataGermanWorkspace = 'Deutsch I';
/** Metadata workspace – Mathematik I */
export const metadataMathWorkspace = 'Mathematik I';
/** Metadata workspace – Mathematik Primar I */
export const metadataMathPrimarWorkspace = 'Mathematik Primar I';
/** Metadata workspace – Mathematik II */
export const metadataMathIIWorkspace = 'Mathematik II';

// =============================================================================
// Users
// =============================================================================

/** Standard non-admin user – used in most multi-user tests */
export const standardUser: UserData = {
  username: 'normaluser',
  password: '5678',
  lastName: '',
  firstName: '',
  email: 'no-mail',
  isAdmin: false
};

/** Secondary non-admin user – for tests requiring two distinct regular users */
export const secondaryUser: UserData = {
  username: 'anotheruser',
  password: '5678',
  lastName: '',
  firstName: '',
  email: 'no-mail-2',
  isAdmin: false
};

/** Group admin user – non-admin with group-admin privileges */
export const groupAdminUser: UserData = {
  username: 'groupadminuser',
  password: '1111',
  isAdmin: false
};

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

// =============================================================================
// Workspace Test Module – Unit Data
// =============================================================================
// Each key below groups all UnitData constants needed by one workspace
// test module. The name of each unit describes its purpose within the
// test that owns it.
// =============================================================================

/**
 * Units used in `units.ts` – core CRUD operations (create, delete, preview,
 * save-or-discard dialog).
 */
export const unitCrudUnits = {
  /** First unit created: tests basic creation & deletion */
  crud1: { shortname: 'CRUD_D1', name: 'CRUD Unit 1', group: 'Gruppe D' } as UnitData,
  /** Second unit created: tests multi-unit creation */
  crud2: { shortname: 'CRUD_E1', name: 'CRUD Unit 2', group: 'Gruppe E' } as UnitData,
  /** Third unit: used for print preview with coding & comments */
  crudPrint: { shortname: 'CRUD_D2', name: 'CRUD Print Unit', group: 'Gruppe D' } as UnitData
};

/**
 * Units used in `unit-move-copy.ts` – move / copy across workspaces.
 */
export const moveCopyUnits = {
  /** Source unit for the copy-from-existing test */
  copySource: { shortname: 'MC_SRC1', name: 'MoveCopy Source', group: 'Gruppe D' } as UnitData,
  /** Unit that gets moved to the other workspace */
  moveTarget: { shortname: 'MC_MOV1', name: 'MoveCopy Move Target', group: 'Gruppe E' } as UnitData,
  /** Unit that gets copied (stays in both workspaces) */
  copyTarget: { shortname: 'MC_CPY1', name: 'MoveCopy Copy Target', group: 'Gruppe D' } as UnitData,
  /** Newly created unit from an existing one */
  newFromExisting: { shortname: 'MC_NEW1', name: 'MoveCopy New From Existing', group: 'Group D' } as UnitData
};

/**
 * Units used in `unit-export.ts` – export & report operations.
 */
export const exportUnits = {
  /** Primary export test unit */
  exportUnit1: { shortname: 'EXP_U1', name: 'Export Unit 1', group: 'Gruppe D' } as UnitData,
  /** Secondary export test unit, also used for codebook export */
  exportUnit2: { shortname: 'EXP_U2', name: 'Export Unit 2', group: 'Group D' } as UnitData
};

/**
 * Units used in `unit-groups.ts` – group creation, rename, delete & user list.
 */
export const groupUnits = {
  /** First unit created inside a new group */
  groupUnit1: { shortname: 'GRP_U1', name: 'Group Test Unit 1', group: 'Neue Testgruppe' } as UnitData,
  /** Second unit added to the same group */
  groupUnit2: { shortname: 'GRP_U2', name: 'Group Test Unit 2', group: 'Neue Testgruppe' } as UnitData
};

/** Group names used specifically in unit-groups.ts tests */
export const groupTestNames = {
  /** Group created from the add-unit dialog */
  newGroup: 'Neue Testgruppe',
  /** Group created from the group management dialog */
  dialogGroup: 'Dialog Testgruppe',
  /** Renamed version of dialogGroup */
  dialogGroupRenamed: 'Dialog Testgruppe Umbenannt',
  /** Custom state added in settings */
  customState: 'In Bearbeitung'
} as const;

/**
 * Units used in `unit-properties.ts` – properties panel CRUD.
 */
export const propertiesUnits = {
  /** Primary unit for property edit/save/persist tests */
  propUnit1: { shortname: 'PROP_U1', name: 'Properties Unit 1', group: 'Gruppe A' } as UnitData,
  /** Secondary unit for multi-field & group assignment tests */
  propUnit2: { shortname: 'PROP_U2', name: 'Properties Unit 2', group: 'Gruppe B' } as UnitData
};

/** Constants used specifically in unit-properties.ts tests */
export const propertiesTestNames = {
  /** Custom state created for state-field tests */
  stateName: 'Fertig',
  /** New group created via the + button in properties panel */
  groupName: 'TestGrp'
} as const;

/**
 * Units & names used in `unit-rich-note-tags.ts` – rich notes CRUD & tag config.
 */
export const richNotesTestNames = {
  /** Temporary group created for the rich-note-tags config block */
  customGroup: 'richNoteGroup2',
  /** Temporary workspace created inside customGroup */
  customWs: 'Ws2'
} as const;

/**
 * Review name used in `reviews.ts`.
 */
export const reviewTestNames = {
  /** The single review created and exercised in the reviews suite */
  reviewName: 'Review1'
} as const;

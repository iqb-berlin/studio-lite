export type NavigationTarget = 'first' | 'last' | 'previous' | 'next' | 'end';
export type Progress = 'none' | 'some' | 'complete';
export type PagingMode =
  | 'separate'
  | 'buttons'
  | 'concat-scroll'
  | 'concat-scroll-snap';
export type PrintMode = 'off' | 'on' | 'on-with-ids' | 'selected-elements-only';

export interface SharedParameter {
  key: string;
  value: string;
}

export interface PlayerConfig {
  printMode?: PrintMode;
  // With printMode 'selected-elements-only' the player drops everything not listed here; otherwise it
  // scrolls the listed elements into view and accentuates them. Either way 'startPage' is ignored.
  elementsToHighlight?: string[];
  unitNumber?: number;
  // Spec: strings, not numbers — unitTitle up to 50, unitId up to 20 characters.
  unitTitle?: string;
  unitId?: string;
  pagingMode?: PagingMode;
  logPolicy?: 'lean' | 'rich' | 'debug' | 'disabled';
  startPage?: string;
  enabledNavigationTargets?: NavigationTarget[];
  directDownloadUrl?: string;
  sharedParameters?: SharedParameter[];
}

export interface UnitState {
  dataParts?: Record<string, string>;
  presentationProgress?: Progress;
  responseProgress?: Progress;
  unitStateDataType?: string;
}

export interface PlayerState {
  validPages?: ValidPage[];
  currentPage?: string;
  sharedParameters?: SharedParameter[];
}

export interface ValidPage {
  id: string;
  label?: string;
}

export interface LogData {
  timeStamp: number;
  key: string;
  content?: string;
}

export interface VopStartCommand {
  type: 'vopStartCommand';
  sessionId: string;
  unitDefinition?: string;
  unitDefinitionType?: string;
  unitState?: UnitState;
  playerConfig?: PlayerConfig;
}

export interface VopRuntimeErrorNotification {
  type: 'vopRuntimeErrorNotification';
  sessionId: string;
  code: string;
  message?: string;
}

export interface VopNavigationDeniedNotification {
  type: 'vopNavigationDeniedNotification';
  sessionId: string;
  reason?: Array<'presentationIncomplete' | 'responsesIncomplete'>;
}

export interface VopPlayerConfigChangedNotification {
  type: 'vopPlayerConfigChangedNotification';
  sessionId: string;
  playerConfig: PlayerConfig;
}

export interface VopPageNavigationCommand {
  type: 'vopPageNavigationCommand';
  sessionId: string;
  target: string;
}

export interface VopReadyNotification {
  type: 'vopReadyNotification';
  metadata: VopMetaData;
}

export interface VopError {
  code: string;
  message?: string;
}

export interface VopMetaData {
  $schema: string;
  id: string;
  type: string;
  version: string;
  specVersion: string;
  metadataVersion: string;
  name: {
    lang: string;
    value: string;
  }[];
  description: {
    lang: string;
    value: string;
  }[];
  maintainer: {
    name: Record<string, string>[];
    email: string;
    url: string;
  };
  code: {
    repositoryType: string;
    licenseType: string;
    licenseUrl: string;
    repositoryUrl: string;
  };
  notSupportedFeatures: string[];
}

export interface VopStateChangedNotification {
  type: 'vopStateChangedNotification';
  sessionId: string;
  timeStamp: number;
  unitState?: UnitState;
  playerState?: PlayerState;
  log?: LogData[];
}

export interface VopUnitNavigationRequestedNotification {
  type: 'vopUnitNavigationRequestedNotification';
  sessionId: string;
  target: 'first' | 'last' | 'previous' | 'next' | 'end';
}

export interface VopWindowFocusChangedNotification {
  type: 'vopWindowFocusChangedNotification';
  timeStamp: number;
  hasFocus: boolean;
}

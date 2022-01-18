export interface KeyValuePairString {
  [K: string]: string;
}

export interface PendingUnitData {
  playerId: string;
  unitState: string;
  unitDefinition: string;
}

export interface PageData {
  index: number;
  id: string;
  type: '#next' | '#previous' | '#goto';
  disabled: boolean;
}

export interface StatusVisual {
  id: string;
  label: string;
  color: string;
  description: string;
}

export interface StateReportEntry {
  key: string; // TestStateKey | TestLogEntryKey | UnitStateKey | PlayerLogKey (unknown, up to the player)
  timeStamp: number;
  content: string;
}

import {
  GroupData,
  UnitData,
  UserData,
  WsData,
  WsSettings
} from './testData';

export const noId: string = '9988';

export const fakeUser: UserData = {
  username: 'fakeuser',
  password: 'paso',
  isAdmin: false
};

export const userGroupAdmin: UserData = {
  username: 'userzwei',
  password: 'paso',
  isAdmin: false
};

export const user3: UserData = {
  username: 'userdrei',
  password: 'paso',
  isAdmin: false
};

export const groupVera: GroupData = {
  id: 'id_group1',
  name: 'VERA2022'
};

export const vera2024: string = 'VERA2024';

export const group2: GroupData = {
  id: 'id_group2',
  name: 'GROUP2022'
};

export const ws1: WsData = {
  id: 'id_ws1',
  name: '01Vorlage',
  state: ['Initial', 'Final']
};

export const ws2: WsData = {
  id: 'id_ws2',
  name: '02Vorlage'
};

export const ws3: WsData = {
  id: 'id_ws3',
  name: '03Lesen'
};

export const unit1: UnitData = {
  shortname: 'D01',
  name: 'Maus',
  group: 'Group1'
};

export const unit2: UnitData = {
  shortname: 'D02',
  name: 'Hund',
  group: 'Group2'
};

export const unit3: UnitData = {
  shortname: 'D03',
  name: 'Tier3',
  group: 'Group3'
};

export const unit4: UnitData = {
  shortname: 'D04',
  name: 'Tier4',
  group: 'Group1'
};

export const setEditor: WsSettings = {
  defaultEditor: 'iqb-editor-aspect@2.12',
  defaultPlayer: 'iqb-player-aspect@2.12',
  defaultSchemer: 'iqb-schemer@2.6',
  unitGroups: ['Bista1', 'Bista2'],
  stableModulesOnly: false,
  unitMDProfile: '',
  itemMDProfile: ''
};

export function getNameAt(initialName: string): string {
  return initialName.replace(/-+(?=[^-\d]*\d)/, '@').replace(/.\d.html$/, '');
}

// eslint-disable-next-line max-classes-per-file
import {
  UnitDefinitionDto, UnitInListDto, UnitMetadataDto, VeronaModuleInListDto
} from '@studio-lite-lib/api-dto';

export interface UnitGroup {
  name: string;
  units: UnitInListDto[];
}

export class UnitCollection {
  groups: UnitGroup[] = [];

  constructor(units: UnitInListDto[]) {
    units.forEach(u => {
      const groupName = u.groupName ? u.groupName : '';
      let groupFound = false;
      this.groups.forEach(g => {
        if (g.name === groupName) {
          g.units.push(u);
          groupFound = true;
        }
      });
      if (!groupFound) {
        this.groups.push({
          name: groupName,
          units: [u]
        });
      }
    });
  }

  units(): UnitInListDto[] {
    const myUnits: UnitInListDto[] = [];
    this.groups.forEach(g => {
      g.units.forEach(u => {
        myUnits.push(u);
      });
    });
    return myUnits;
  }
}

export class ModuleCollection {
  moduleData: { [key: string]: VeronaModuleInListDto };
  constructor(modules: VeronaModuleInListDto[]) {
    this.moduleData = {};
    modules.forEach(m => {
      this.moduleData[m.key] = m;
    });
  }

  isInList(key: string): boolean {
    return !!this.moduleData[key];
  }

  getBestMatch(key: string): string {
    if (this.isInList(key)) return key;
    const regexPattern = /^([A-Za-z\d_-]+)@(\d+)\.(\d+)/;
    const matches1 = regexPattern.exec(key);
    if (!matches1 || matches1.length !== 4) return '';
    let bestMatchId = '';
    let bestMatchMinor = +matches1[3];
    Object.keys(this.moduleData).forEach(k => {
      const matches2 = regexPattern.exec(k);
      if (matches2 && matches2.length === 4) {
        if ((matches2[1] === matches1[1]) && (matches2[2] === matches1[2])) {
          const minor = +matches2[3];
          if (minor > bestMatchMinor) {
            bestMatchMinor = minor;
            bestMatchId = k;
          }
        }
      }
    });
    if (bestMatchId) return bestMatchId;
    return '';
  }

  isValid(key: string): boolean | string {
    if (this.moduleData[key]) return true;
    const bestMatch = this.getBestMatch(key);
    return bestMatch || false;
  }

  getName(key: string): string {
    const dataEntry = this.moduleData[key];
    if (dataEntry) {
      return dataEntry.metadata.name;
    }
    return '?';
  }

  hasEntries(): boolean {
    return Object.keys(this.moduleData).length > 0;
  }

  getEntries(): VeronaModuleInListDto[] {
    const regexPattern = /^([A-Za-z\d_-]+)@(\d+)\.(\d+)/;
    const newList: { [key: string]: VeronaModuleInListDto } = {};
    Object.keys(this.moduleData).forEach(key => {
      const matches1 = regexPattern.exec(key);
      if (matches1 && matches1.length === 4) {
        const major = matches1[2].padStart(20, '0');
        const minor = matches1[3].padStart(20, '0');
        newList[`${matches1[2]}@${major}.${minor}`] = this.moduleData[key];
      }
    });
    const newKeys = Object.keys(newList).sort();
    return newKeys.map(key => newList[key]);
  }
}

export class UnitMetadataStore {
  private originalData: UnitMetadataDto;
  private changedData: UnitMetadataDto;

  constructor(originalData: UnitMetadataDto) {
    this.originalData = originalData;
    this.changedData = <UnitMetadataDto>{ id: originalData.id };
  }

  setPlayer(newPlayer: string) {
    if (newPlayer === this.originalData.player) {
      if (this.changedData.player) delete this.changedData.player;
    } else {
      this.changedData.player = newPlayer;
    }
  }

  setEditor(newEditor: string) {
    if (newEditor === this.originalData.editor) {
      if (this.changedData.editor) delete this.changedData.editor;
    } else {
      this.changedData.editor = newEditor;
    }
  }

  setBasicData(newKey: string, newName: string, newDescription: string) {
    if (newKey === this.originalData.key) {
      if (this.changedData.key) delete this.changedData.key;
    } else {
      this.changedData.key = newKey;
    }
    if (newName === this.originalData.name) {
      if (this.changedData.name) delete this.changedData.name;
    } else {
      this.changedData.name = newName;
    }
    if (newDescription === this.originalData.description) {
      if (this.changedData.description) delete this.changedData.description;
    } else {
      this.changedData.description = newDescription;
    }
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 1;
  }

  isKeyOrNameChanged(): boolean {
    const dataKeys = Object.keys(this.changedData);
    return (dataKeys.indexOf('key') >= 0 || dataKeys.indexOf('name') >= 0);
  }

  getChangedData(): UnitMetadataDto {
    return this.changedData;
  }

  getData(): UnitMetadataDto {
    return { ...this.originalData, ...this.changedData };
  }

  applyChanges() {
    this.originalData = this.getData();
    this.changedData = <UnitMetadataDto>{ id: this.originalData.id };
  }

  restore() {
    this.changedData = <UnitMetadataDto>{ id: this.originalData.id };
  }
}

export class UnitDefinitionStore {
  private originalData: UnitDefinitionDto;
  private changedData: UnitDefinitionDto;
  private unitId: number;

  constructor(unitId: number, originalData: UnitDefinitionDto) {
    this.unitId = unitId;
    this.originalData = originalData;
    this.changedData = <UnitDefinitionDto>{};
  }

  setData(newVariables: never[], newDefinition: string) {
    if (newVariables === this.originalData.variables) {
      if (this.changedData.variables) delete this.changedData.variables;
    } else {
      this.changedData.variables = newVariables;
    }
    if (newDefinition === this.originalData.definition) {
      if (this.changedData.definition) delete this.changedData.definition;
    } else {
      this.changedData.definition = newDefinition;
    }
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 1;
  }

  getChangedData(): UnitDefinitionDto {
    return this.changedData;
  }

  getData(): UnitDefinitionDto {
    return { ...this.originalData, ...this.changedData };
  }

  applyChanges() {
    this.originalData = this.getData();
    this.changedData = <UnitDefinitionDto>{};
  }

  restore() {
    this.changedData = <UnitDefinitionDto>{};
  }
}

import {UnitDefinitionDto, UnitInListDto, UnitMetadataDto, VeronaModuleInListDto} from "@studio-lite-lib/api-dto";

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
          groupFound = true
        }
      });
      if (!groupFound) {
        this.groups.push({
          name: groupName,
          units: [u]
        })
      }
    })
  }

  units(): UnitInListDto[] {
    const myUnits: UnitInListDto[] = [];
    this.groups.forEach(g => {
      g.units.forEach(u => {
        myUnits.push(u)
      })
    })
    return myUnits;
  }
}

export class ModuleCollection {
  moduleData: {[key: string]: VeronaModuleInListDto};
  constructor(modules: VeronaModuleInListDto[]) {
    this.moduleData = {};
    modules.forEach(m => {
      this.moduleData[m.key] = m;
    })
  }

  isInList(key: string): boolean {
    return !!this.moduleData[key]
  }

  isValid(key: string): boolean | string {
    if (this.moduleData[key]) return true;
    const regexPattern = /^([A-Za-z0-9_-]+)@(\d+)\.(\d+)/;
    const matches1 = regexPattern.exec(key);
    if (!matches1 || matches1.length !== 4) return false;
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
    return false;
  }

  getName(key: string): string {
    const dataEntry = this.moduleData[key];
    if (dataEntry) {
      return dataEntry.metadata.name
    }
    return '?'
  }

  getEntries(): VeronaModuleInListDto[] {
    const regexPattern = /^([A-Za-z0-9_-]+)@(\d+)\.(\d+)/;
    const newList: {[key: string]: VeronaModuleInListDto} = {};
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

  getFile(key: string): any {
    return this.moduleData[key].metadata
  }
}

export class UnitMetadataStore {
  private originalData: UnitMetadataDto;
  private changedData: UnitMetadataDto;

  constructor(originalData: UnitMetadataDto) {
    this.originalData = originalData;
    this.changedData = <UnitMetadataDto>{id: originalData.id}
  }

  setPlayer(newPlayer: string) {
    if (newPlayer === this.originalData.player) {
      if (this.changedData.player) this.changedData.player = undefined;
    } else {
      this.changedData.player = newPlayer;
    }
  }

  setEditor(newEditor: string) {
    if (newEditor === this.originalData.editor) {
      if (this.changedData.editor) this.changedData.editor = undefined;
    } else {
      this.changedData.editor = newEditor;
    }
  }

  setBasicData(newKey: string, newName: string, newDescription: string) {
    if (newKey === this.originalData.key) {
      if (this.changedData.key) this.changedData.key = undefined;
    } else {
      this.changedData.key = newKey;
    }
    if (newName === this.originalData.name) {
      if (this.changedData.name) this.changedData.name = undefined;
    } else {
      this.changedData.name = newName;
    }
    if (newDescription === this.originalData.description) {
      if (this.changedData.description) this.changedData.description = undefined;
    } else {
      this.changedData.description = newDescription;
    }
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 1
  }

  isKeyOrNameChanged(): boolean {
    return !!(this.changedData.key || this.changedData.name)
  }

  getChangedData(): UnitMetadataDto {
    return this.changedData
  }

  getData(): UnitMetadataDto {
    return {...this.originalData, ...this.changedData}
  }

  applyChanges() {
    this.originalData = this.getData();
    this.changedData = <UnitMetadataDto>{id: this.originalData.id}
  }

  restore() {
    this.changedData = <UnitMetadataDto>{id: this.originalData.id}
  }
}

export class UnitDefinitionStore {
  private originalData: UnitDefinitionDto;
  private changedData: UnitDefinitionDto;

  constructor(originalData: UnitDefinitionDto) {
    this.originalData = originalData;
    this.changedData = <UnitDefinitionDto>{id: originalData.id}
  }

  setData(newVariables: string, newDefinition: string) {
    if (newVariables === this.originalData.variables) {
      if (this.changedData.variables) this.changedData.variables = undefined;
    } else {
      this.changedData.variables = newVariables;
    }
    if (newDefinition === this.originalData.definition) {
      if (this.changedData.definition) this.changedData.definition = undefined;
    } else {
      this.changedData.definition = newDefinition;
    }
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 1
  }

  getChangedData(): UnitDefinitionDto {
    return this.changedData
  }

  getData(): UnitDefinitionDto {
    return {...this.originalData, ...this.changedData}
  }

  applyChanges() {
    this.originalData = this.getData();
    this.changedData = <UnitMetadataDto>{id: this.originalData.id}
  }

  restore() {
    this.changedData = <UnitMetadataDto>{id: this.originalData.id}
  }
}

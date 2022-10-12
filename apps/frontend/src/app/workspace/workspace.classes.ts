// eslint-disable-next-line max-classes-per-file
import {
  UnitDefinitionDto, UnitMetadataDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';

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

  setSchemer(newSchemer: string) {
    if (newSchemer === this.originalData.schemer) {
      if (this.changedData.schemer) delete this.changedData.schemer;
    } else {
      this.changedData.schemer = newSchemer;
    }
  }

  setBasicData(newKey: string, newName: string, newDescription: string, newGroup: string) {
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
    if (newGroup === this.originalData.groupName) {
      if (this.changedData.groupName) delete this.changedData.groupName;
    } else {
      this.changedData.groupName = newGroup;
    }
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 1;
  }

  isKeyOrNameOrGroupChanged(): boolean {
    const dataKeys = Object.keys(this.changedData);
    return (dataKeys.indexOf('key') >= 0 || dataKeys.indexOf('name') >= 0 || dataKeys.indexOf('groupName') >= 0);
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

  setData(newVariables: unknown[], newDefinition: string) {
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

export class UnitSchemeStore {
  private originalData: UnitSchemeDto;
  private changedData: UnitSchemeDto;
  private unitId: number;

  constructor(unitId: number, originalData: UnitSchemeDto) {
    this.unitId = unitId;
    this.originalData = originalData;
    this.changedData = <UnitSchemeDto>{};
  }

  setData(newScheme: string, newSchemeType: string) {
    this.changedData = <UnitSchemeDto>{
      scheme: newScheme,
      schemeType: newSchemeType
    };
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 1;
  }

  getChangedData(): UnitSchemeDto {
    return this.changedData;
  }

  getData(): UnitSchemeDto {
    return { ...this.originalData, ...this.changedData };
  }

  applyChanges() {
    this.originalData = this.getData();
    this.changedData = <UnitSchemeDto>{};
  }

  restore() {
    this.changedData = <UnitSchemeDto>{};
  }
}

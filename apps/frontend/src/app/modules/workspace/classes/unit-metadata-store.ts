import { UnitMetadataValues, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { EventEmitter } from '@angular/core';

export class UnitMetadataStore {
  dataChange: EventEmitter<void> = new EventEmitter<void>();
  private originalData: UnitPropertiesDto;
  private changedData: UnitPropertiesDto;

  constructor(originalData: UnitPropertiesDto) {
    this.originalData = originalData;
    this.changedData = <UnitPropertiesDto>{ id: originalData.id };
  }

  setPlayer(newPlayer: string): void {
    if (newPlayer === this.originalData.player) {
      if (this.changedData.player) delete this.changedData.player;
    } else {
      this.changedData.player = newPlayer;
    }
    this.dataChange.emit();
  }

  setEditor(newEditor: string): void {
    if (newEditor === this.originalData.editor) {
      if (this.changedData.editor) delete this.changedData.editor;
    } else {
      this.changedData.editor = newEditor;
    }
    this.dataChange.emit();
  }

  setSchemer(newSchemer: string): void {
    if (newSchemer === this.originalData.schemer) {
      if (this.changedData.schemer) delete this.changedData.schemer;
    } else {
      this.changedData.schemer = newSchemer;
    }
    this.dataChange.emit();
  }

  setBasicData(
    newKey: string,
    newName: string,
    newDescription: string,
    newGroup: string,
    newTranscript: string,
    newReference: string,
    newState:string
  ) {
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
    if (newTranscript === this.originalData.transcript) {
      if (this.changedData.transcript) delete this.changedData.transcript;
    } else {
      this.changedData.transcript = newTranscript;
    }
    if (newReference === this.originalData.reference) {
      if (this.changedData.reference) delete this.changedData.reference;
    } else {
      this.changedData.reference = newReference;
    }
    if (newState === this.originalData.state) {
      if (this.changedData.state) delete this.changedData.state;
    } else {
      this.changedData.state = newState;
    }
    this.dataChange.emit();
  }

  setMetadata(newMetadata: UnitMetadataValues): void {
    if (JSON.stringify(newMetadata) === JSON.stringify(this.originalData.metadata)) {
      if (this.changedData.metadata) delete this.changedData.metadata;
    } else {
      this.changedData.metadata = JSON.parse(JSON.stringify(newMetadata));
    }
    this.dataChange.emit();
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 1;
  }

  isKeyOrNameOrGroupOrStateChanged(): boolean {
    const dataKeys = Object.keys(this.changedData);
    return (dataKeys.indexOf('key') >= 0 ||
      dataKeys.indexOf('name') >= 0 || dataKeys.indexOf('groupName') >= 0 || dataKeys.indexOf('state') >= 0);
  }

  getChangedData(): UnitPropertiesDto {
    return this.changedData;
  }

  getData(): UnitPropertiesDto {
    return { ...this.originalData, ...this.changedData };
  }

  applyChanges(): void {
    this.originalData = this.getData();
    this.restore();
  }

  restore(): void {
    this.changedData = <UnitPropertiesDto>{ id: this.originalData.id };
    this.dataChange.emit();
  }
}

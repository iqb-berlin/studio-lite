import { UnitMetadataDto } from '@studio-lite-lib/api-dto';

export class UnitMetadataStore {
  private originalData: UnitMetadataDto;
  private changedData: UnitMetadataDto;

  constructor(originalData: UnitMetadataDto) {
    this.originalData = originalData;
    this.changedData = <UnitMetadataDto>{ id: originalData.id };
  }

  setPlayer(newPlayer: string): void {
    if (newPlayer === this.originalData.player) {
      if (this.changedData.player) delete this.changedData.player;
    } else {
      this.changedData.player = newPlayer;
    }
  }

  setEditor(newEditor: string): void {
    if (newEditor === this.originalData.editor) {
      if (this.changedData.editor) delete this.changedData.editor;
    } else {
      this.changedData.editor = newEditor;
    }
  }

  setSchemer(newSchemer: string): void {
    if (newSchemer === this.originalData.schemer) {
      if (this.changedData.schemer) delete this.changedData.schemer;
    } else {
      this.changedData.schemer = newSchemer;
    }
  }

  setBasicData(
    newKey: string,
    newName: string,
    newDescription: string,
    newGroup: string,
    newTranscript: string,
    newReference: string
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
  }

  setMetadata(newMetadata: any): void {
    if (JSON.stringify(newMetadata) === JSON.stringify(this.originalData.metadata)) {
      if (this.changedData.metadata) delete this.changedData.metadata;
    } else {
      this.changedData.metadata = newMetadata;
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

  applyChanges(): void {
    this.originalData = this.getData();
    this.changedData = <UnitMetadataDto>{ id: this.originalData.id };
  }

  restore(): void {
    this.changedData = <UnitMetadataDto>{ id: this.originalData.id };
  }
}

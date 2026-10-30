import { UnitMetadataValues, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { EventEmitter, Signal, signal } from '@angular/core';
import { dropSavedChanges } from '../utils/saved-changes.utils';

type TextField =
  'key' | 'name' | 'description' | 'groupName' | 'transcript' | 'reference' | 'state' | 'player' | 'editor' | 'schemer';

/**
 * The unit's properties and metadata while they are being edited, in the same shape as
 * {@link UnitDefinitionStore}: the loaded state, and beside it the fields that differ from it. The
 * id is always carried, since it names what is to be patched. {@link changed} holds whether
 * anything is unsaved as a signal, {@link dataChange} reports each edit as an event.
 */
export class UnitMetadataStore {
  dataChange: EventEmitter<void> = new EventEmitter<void>();
  private readonly changedState = signal(false);
  readonly changed: Signal<boolean> = this.changedState.asReadonly();
  private originalData: UnitPropertiesDto;
  private changedData: UnitPropertiesDto;

  constructor(originalData: UnitPropertiesDto) {
    this.originalData = originalData;
    this.changedData = <UnitPropertiesDto>{ id: originalData.id };
  }

  setPlayer(newPlayer: string): void {
    this.setField('player', newPlayer);
    this.notifyChange();
  }

  setEditor(newEditor: string): void {
    this.setField('editor', newEditor);
    this.notifyChange();
  }

  setSchemer(newSchemer: string): void {
    this.setField('schemer', newSchemer);
    this.notifyChange();
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
    this.setField('key', newKey);
    this.setField('name', newName);
    this.setField('description', newDescription);
    this.setField('groupName', newGroup);
    this.setField('transcript', newTranscript);
    this.setField('reference', newReference);
    this.setField('state', newState);
    this.notifyChange();
  }

  setMetadata(newMetadata: UnitMetadataValues): void {
    if (JSON.stringify(newMetadata) === JSON.stringify(this.originalData.metadata)) {
      if (this.changedData.metadata) delete this.changedData.metadata;
    } else {
      this.changedData.metadata = JSON.parse(JSON.stringify(newMetadata));
    }
    this.notifyChange();
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 1;
  }

  isKeyOrNameOrGroupOrStateChanged(): boolean {
    const dataKeys = Object.keys(this.changedData);
    return (dataKeys.indexOf('key') >= 0 ||
      dataKeys.indexOf('name') >= 0 || dataKeys.indexOf('groupName') >= 0 || dataKeys.indexOf('state') >= 0);
  }

  /** A copy: what is sent must not change with the edits made while it is under way (#1845). */
  getChangedData(): UnitPropertiesDto {
    return structuredClone(this.changedData);
  }

  getData(): UnitPropertiesDto {
    return { ...this.originalData, ...this.changedData };
  }

  /**
   * Takes what was sent as saved. Fields edited again since then stay changes: nobody sent their
   * new values yet, and taking them as saved lost them (#1845).
   */
  applyChanges(sent: UnitPropertiesDto): void {
    this.originalData = { ...this.originalData, ...sent };
    dropSavedChanges(this.changedData, sent);
    this.changedData.id = this.originalData.id;
    this.notifyChange();
  }

  /**
   * Takes the metadata as the server has stored it as the new starting point, in place of what was
   * sent. Items created by a save get their uuid only there; without it the next save named them as
   * new again, and the server deleted and recreated them, links and all (#1830). Metadata edited
   * again while the save was under way stays a change (#1845), as do the other changed fields, and
   * the store stays the same object, so whoever listens to it keeps listening.
   */
  reloadMetadata(metadata: UnitMetadataValues): void {
    this.originalData = { ...this.originalData, metadata };
    this.notifyChange();
  }

  restore(): void {
    this.changedData = <UnitPropertiesDto>{ id: this.originalData.id };
    this.notifyChange();
  }

  /**
   * A value set back to the loaded one is no change any more, whatever it was changed to before: an
   * empty one was kept, and saving emptied the field (#1992).
   */
  private setField(field: TextField, newValue: string): void {
    if (newValue === this.originalData[field]) {
      delete this.changedData[field];
    } else {
      this.changedData[field] = newValue;
    }
  }

  private notifyChange(): void {
    this.changedState.set(this.isChanged());
    this.dataChange.emit();
  }
}

import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import {
  EventEmitter, Signal, signal, WritableSignal
} from '@angular/core';
import { dropSavedChanges } from '../utils/saved-changes.utils';

const TEXT_FIELDS = [
  'key', 'name', 'description', 'groupName', 'transcript', 'reference', 'state', 'player', 'editor', 'schemer'
] as const;
type TextField = typeof TEXT_FIELDS[number];

/**
 * The unit's properties while they are being edited, in the same shape as
 * {@link UnitDefinitionStore}: the loaded state, and beside it the latest value entered for each
 * field. A field is a change while that value differs from what is saved, which is measured again
 * after each save: set back to the old value while the save was under way, it differs from the
 * value just saved (#2087). The id is always carried, since it names what is to be patched.
 * {@link changed} holds whether anything is unsaved as a signal, {@link dataChange} reports each
 * edit as an event. The metadata have a store of their own, {@link UnitMetadataStore} (#2200).
 */
export class UnitPropertiesStore {
  dataChange: EventEmitter<void> = new EventEmitter<void>();
  private readonly changedState = signal(false);
  readonly changed: Signal<boolean> = this.changedState.asReadonly();
  private readonly dataState: WritableSignal<UnitPropertiesDto>;
  /**
   * What {@link getData} answers, as a signal for whoever derives from it -- the technical validation
   * reads the modules from it, saved or not (#2135).
   */
  readonly data: Signal<UnitPropertiesDto>;
  private originalData: UnitPropertiesDto;
  private reported: Partial<UnitPropertiesDto> = {};
  private changedData: UnitPropertiesDto;

  /**
   * @param loaded false for the store of a unit the server did not answer for: it holds the id alone,
   * and what it lacks is not empty but unknown (#2004).
   */
  constructor(originalData: UnitPropertiesDto, readonly loaded = true) {
    this.originalData = originalData;
    this.changedData = { id: originalData.id };
    this.dataState = signal(this.getData());
    this.data = this.dataState.asReadonly();
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
   * The id and the fields entered that differ from what is saved. A value set back to the loaded
   * one is no change any more, whatever it was changed to before: an empty one was kept, and saving
   * emptied the field (#1992).
   */
  private computeChangedData(): UnitPropertiesDto {
    const changes = <UnitPropertiesDto>{ id: this.originalData.id };
    TEXT_FIELDS.forEach(field => {
      const value = this.reported[field];
      if (value !== undefined && value !== this.originalData[field]) changes[field] = value;
    });
    return changes;
  }

  /**
   * Takes what was sent as saved. Fields edited again since then stay changes: nobody sent their
   * new values yet, and taking them as saved lost them (#1845).
   */
  applyChanges(sent: UnitPropertiesDto): void {
    this.originalData = { ...this.originalData, ...sent };
    dropSavedChanges(this.reported, sent);
    this.notifyChange();
  }

  restore(): void {
    this.reported = {};
    this.notifyChange();
  }

  private setField(field: TextField, newValue: string): void {
    this.reported[field] = newValue;
  }

  private notifyChange(): void {
    this.changedData = this.computeChangedData();
    this.changedState.set(this.isChanged());
    this.dataState.set(this.getData());
    this.dataChange.emit();
  }
}

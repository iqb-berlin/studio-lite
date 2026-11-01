import { UnitMetadataValues, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { EventEmitter, Signal, signal } from '@angular/core';
import { dropSavedChanges } from '../utils/saved-changes.utils';

const TEXT_FIELDS = [
  'key', 'name', 'description', 'groupName', 'transcript', 'reference', 'state', 'player', 'editor', 'schemer'
] as const;
type TextField = typeof TEXT_FIELDS[number];

/**
 * Metadata edited again while their save was under way, with the uuids the save gave its new items. Named
 * without them, the next save would have the server delete these items and create them anew, links and all
 * (#1830). The server keeps the item's id, so the new items are found by it, each uuid given out once.
 */
function withSavedItemUuids(edited: UnitMetadataValues, saved: UnitMetadataValues): UnitMetadataValues {
  if (!edited.items) return edited;
  const known = new Set(edited.items.map(item => item.uuid).filter(uuid => uuid));
  const created = (saved.items || []).filter(item => item.uuid && !known.has(item.uuid));
  return {
    ...edited,
    items: edited.items.map(item => {
      if (item.uuid || item.id === undefined) return item;
      const index = created.findIndex(savedItem => savedItem.id === item.id);
      if (index < 0) return item;
      const [savedItem] = created.splice(index, 1);
      return { ...item, uuid: savedItem.uuid };
    })
  };
}

/**
 * The unit's properties and metadata while they are being edited, in the same shape as
 * {@link UnitDefinitionStore}: the loaded state, and beside it the latest value entered for each
 * field. A field is a change while that value differs from what is saved, which is measured again
 * after each save: set back to the old value while the save was under way, it differs from the
 * value just saved (#2087). The id is always carried, since it names what is to be patched.
 * {@link changed} holds whether anything is unsaved as a signal, {@link dataChange} reports each
 * edit as an event.
 */
export class UnitMetadataStore {
  dataChange: EventEmitter<void> = new EventEmitter<void>();
  private readonly changedState = signal(false);
  readonly changed: Signal<boolean> = this.changedState.asReadonly();
  private originalData: UnitPropertiesDto;
  private reported: Partial<UnitPropertiesDto> = {};
  // computed once per change: comparing the metadata runs over all of it
  private changedData: UnitPropertiesDto;

  /**
   * @param loaded false for the store of a unit the server did not answer for: it holds the id alone,
   * and what it lacks is not empty but unknown (#2004).
   */
  constructor(originalData: UnitPropertiesDto, readonly loaded = true) {
    this.originalData = originalData;
    this.changedData = { id: originalData.id };
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
    this.reported.metadata = JSON.parse(JSON.stringify(newMetadata));
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
    const metadata = this.reported.metadata;
    if (metadata !== undefined && JSON.stringify(metadata) !== JSON.stringify(this.originalData.metadata)) {
      changes.metadata = metadata;
    }
    return changes;
  }

  /**
   * Takes what was sent as saved. Fields edited again since then stay changes: nobody sent their
   * new values yet, and taking them as saved lost them (#1845). What was entered and sent is not
   * needed any more: {@link reloadMetadata} replaces the metadata sent with the server's, which carry
   * the uuids of new items, and the sent ones would count as a change against them (#1830).
   */
  applyChanges(sent: UnitPropertiesDto): void {
    this.originalData = { ...this.originalData, ...sent };
    dropSavedChanges(this.reported, sent);
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
    if (this.reported.metadata) this.reported.metadata = withSavedItemUuids(this.reported.metadata, metadata);
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
    this.dataChange.emit();
  }
}

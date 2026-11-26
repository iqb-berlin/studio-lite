import { UnitMetadataValues } from '@studio-lite-lib/api-dto';
import {
  EventEmitter, Signal, signal, WritableSignal
} from '@angular/core';

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

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/**
 * The unit's metadata -- its profiles and its items -- while they are being edited, beside the
 * properties since they have a tab of their own (#2200). The stored state, and beside it what the
 * forms reported last; a change while the two differ, measured again after each save (#1845).
 * {@link changed} holds whether anything is unsaved, {@link dataChange} reports each edit.
 *
 * It carries the unit it was loaded for: whoever writes into it or saves it can tell it from the
 * store of a unit opened meanwhile.
 */
export class UnitMetadataStore {
  dataChange: EventEmitter<void> = new EventEmitter<void>();
  private readonly changedState = signal(false);
  readonly changed: Signal<boolean> = this.changedState.asReadonly();
  private originalData: UnitMetadataValues;
  private reported: UnitMetadataValues | undefined;
  private readonly dataState: WritableSignal<UnitMetadataValues>;
  /** The metadata as {@link getData} gives them, for whoever derives from them as they are edited (#2235). */
  readonly data: Signal<UnitMetadataValues>;

  constructor(readonly unitId: number, originalData: UnitMetadataValues) {
    this.originalData = originalData;
    this.dataState = signal(originalData);
    this.data = this.dataState.asReadonly();
  }

  setMetadata(newMetadata: UnitMetadataValues): void {
    this.reported = JSON.parse(JSON.stringify(newMetadata));
    this.notifyChange();
  }

  isChanged(): boolean {
    return this.changedState();
  }

  /** A copy: what is sent must not change with the edits made while it is under way (#1845). */
  getChangedData(): UnitMetadataValues | undefined {
    return this.isChanged() ? structuredClone(this.reported) : undefined;
  }

  getData(): UnitMetadataValues {
    return this.isChanged() && this.reported ? this.reported : this.originalData;
  }

  /**
   * Takes the metadata as the server stored them once `sent` was saved, as the new starting point: the
   * items the save created have their uuid only there, and named as new again, the next save had the
   * server delete and recreate them, links and all (#1830). Metadata edited again while the save was
   * under way stay a change, their new items given the uuids the save gave them (#1845).
   */
  applySaved(sent: UnitMetadataValues, stored: UnitMetadataValues): void {
    this.originalData = stored;
    if (this.reported && same(this.reported, sent)) this.reported = undefined;
    if (this.reported) this.reported = withSavedItemUuids(this.reported, stored);
    this.notifyChange();
  }

  restore(): void {
    this.reported = undefined;
    this.notifyChange();
  }

  // measured once per change: the comparison runs over all of the metadata, and every edit in the forms
  // reads the store again
  private notifyChange(): void {
    this.changedState.set(this.reported !== undefined && !same(this.reported, this.originalData));
    this.dataState.set(this.getData());
    this.dataChange.emit();
  }
}

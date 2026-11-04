import { UnitSchemeDto } from '@studio-lite-lib/api-dto';
import {
  EventEmitter, Signal, signal, WritableSignal
} from '@angular/core';

/**
 * The unit's coding scheme while it is being edited. The schemer reports the whole scheme, type
 * included, and the latest report is a change only while its scheme differs from what is saved: a
 * scheme edited and edited back was saved anyway and stamped the unit as changed (#1333). The type
 * travels with the scheme and is no change on its own. {@link changed} holds the same answer as a
 * signal, {@link dataChange} reports each edit as an event.
 */
export class UnitSchemeStore {
  dataChange: EventEmitter<void> = new EventEmitter<void>();
  private readonly changedState = signal(false);
  readonly changed: Signal<boolean> = this.changedState.asReadonly();
  private readonly dataState: WritableSignal<UnitSchemeDto>;
  /** What {@link getData} answers, as a signal for whoever derives from it (#1361). */
  readonly data: Signal<UnitSchemeDto>;
  private originalData: UnitSchemeDto;
  /**
   * The schemer's latest report, kept even while it matches what is saved: measured again after a
   * save, a scheme edited back to the old one during the save is a change again (#1845).
   */
  private reported: UnitSchemeDto | undefined;
  private unitId: number;

  constructor(unitId: number, originalData: UnitSchemeDto) {
    this.unitId = unitId;
    this.originalData = originalData;
    this.dataState = signal(this.getData());
    this.data = this.dataState.asReadonly();
  }

  setData(newScheme: string, newSchemeType: string) {
    this.reported = {
      scheme: newScheme,
      schemeType: newSchemeType
    };
    this.notifyChange();
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 0;
  }

  private get changedData(): UnitSchemeDto {
    return this.reported && this.reported.scheme !== this.originalData.scheme ?
      { ...this.reported } :
      <UnitSchemeDto>{};
  }

  /** A copy: what is sent must not change with the reports that arrive while it is under way (#1845). */
  getChangedData(): UnitSchemeDto {
    return { ...this.changedData };
  }

  getData(): UnitSchemeDto {
    return { ...this.originalData, ...this.changedData };
  }

  /**
   * Takes what was sent as saved. A scheme the schemer reported since then stays a change, as its
   * latest report is measured against the scheme now saved (#1845).
   */
  applyChanges(sent: UnitSchemeDto) {
    this.originalData = { ...this.originalData, ...sent };
    this.notifyChange();
  }

  restore() {
    this.reported = undefined;
    this.notifyChange();
  }

  private notifyChange(): void {
    this.changedState.set(this.isChanged());
    this.dataState.set(this.getData());
    this.dataChange.emit();
  }
}

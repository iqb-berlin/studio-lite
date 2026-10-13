import { UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { EventEmitter, Signal, signal } from '@angular/core';

/**
 * The unit's coding scheme while it is being edited. Unlike the other two stores it does not compare
 * against what was loaded: the schemer reports the whole scheme, so any report is taken as a change
 * and {@link isChanged} only asks whether one has arrived. {@link changed} holds the same answer as
 * a signal, {@link dataChange} reports each edit as an event.
 */
export class UnitSchemeStore {
  dataChange: EventEmitter<void> = new EventEmitter<void>();
  private readonly changedState = signal(false);
  readonly changed: Signal<boolean> = this.changedState.asReadonly();
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
    this.notifyChange();
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 1;
  }

  /** A copy: what is sent must not change with the reports that arrive while it is under way (#1845). */
  getChangedData(): UnitSchemeDto {
    return { ...this.changedData };
  }

  getData(): UnitSchemeDto {
    return { ...this.originalData, ...this.changedData };
  }

  /**
   * Takes what was sent as saved. A scheme the schemer reported since then stays a change (#1845).
   * The report is kept whole, scheme and type together, since {@link isChanged} counts only a whole
   * report as a change.
   */
  applyChanges(sent: UnitSchemeDto) {
    this.originalData = { ...this.originalData, ...sent };
    if (JSON.stringify(this.changedData) === JSON.stringify(sent)) this.changedData = <UnitSchemeDto>{};
    this.notifyChange();
  }

  restore() {
    this.changedData = <UnitSchemeDto>{};
    this.notifyChange();
  }

  private notifyChange(): void {
    this.changedState.set(this.isChanged());
    this.dataChange.emit();
  }
}

import { UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { EventEmitter } from '@angular/core';

/**
 * The unit's coding scheme while it is being edited. Unlike the other two stores it does not compare
 * against what was loaded: the schemer reports the whole scheme, so any report is taken as a change
 * and {@link isChanged} only asks whether one has arrived.
 */
export class UnitSchemeStore {
  dataChange: EventEmitter<void> = new EventEmitter<void>();
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
    this.dataChange.emit();
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
    this.restore();
  }

  restore() {
    this.changedData = <UnitSchemeDto>{};
    this.dataChange.emit();
  }
}

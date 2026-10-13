import { UnitDefinitionDto } from '@studio-lite-lib/api-dto';
import { EventEmitter, Signal, signal } from '@angular/core';
import { sameVariableLists, VariableInfoInEitherSpelling } from '@studio-lite/shared-code';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';

/**
 * The unit's definition while it is being worked on: what was loaded, and beside it only what has
 * actually changed. A value edited back to what it was is removed again, so "is there anything to
 * save" is answered by whether that second object holds anything at all.
 *
 * Only the changed part is sent when the unit is saved, which is why a definition and its variables
 * are tracked separately here.
 *
 * Two ways out, for two kinds of listener: {@link changed} is the state -- whether anything is
 * unsaved, readable at any time, also by whoever comes late -- and {@link dataChange} the event, for
 * those that pass every edit on to a module.
 */
export class UnitDefinitionStore {
  dataChange: EventEmitter<void> = new EventEmitter<void>();
  private readonly changedState = signal(false);
  readonly changed: Signal<boolean> = this.changedState.asReadonly();
  private originalData: UnitDefinitionDto;
  private changedData: UnitDefinitionDto;
  private unitId: number;

  constructor(unitId: number, originalData: UnitDefinitionDto) {
    this.unitId = unitId;
    this.originalData = originalData;
    this.changedData = <UnitDefinitionDto>{};
  }

  /**
   * Takes what the editor reports. Its variable list is kept in the spelling the editor used
   * (VariableInfo 1.x or 2.x, #1708) and compared regardless of spelling and key order: an editor
   * following 2.x would otherwise mark every unit stored in 1.x as changed the moment it reports its
   * unchanged list (#1606). Readers that still need 1.x get it where the list leaves the studio.
   *
   * The definition's format (`unitDefinitionType`) travels with the definition and never on its
   * own: reported with an unchanged definition it is not a change, or every unit saved before the
   * format was recorded would count as edited the moment an editor that reports it opens it.
   * Reported by nobody alongside a changed definition, it is dropped, since the stored one may no
   * longer describe what the editor wrote (#1368).
   */
  setData(newVariables: VariableInfoInEitherSpelling[], newDefinition: string, newDefinitionType?: string) {
    if (sameVariableLists(newVariables, this.originalData.variables)) {
      if (this.changedData.variables) delete this.changedData.variables;
    } else {
      // the DTO is typed with the 1.x spelling; the list is stored as reported
      this.changedData.variables = newVariables as VariableInfo[];
    }
    if (newDefinition === this.originalData.definition) {
      if (this.changedData.definition) delete this.changedData.definition;
    } else {
      this.changedData.definition = newDefinition;
    }
    if (this.changedData.definition !== undefined && newDefinitionType) {
      this.changedData.definitionType = newDefinitionType;
    } else {
      delete this.changedData.definitionType;
    }
    this.notifyChange();
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 0;
  }

  getChangedData(): UnitDefinitionDto {
    return this.changedData;
  }

  getData(): UnitDefinitionDto {
    const data = { ...this.originalData, ...this.changedData };
    // a changed definition without a type of its own must not inherit the stored one
    if (this.changedData.definition !== undefined && !this.changedData.definitionType) {
      delete data.definitionType;
    }
    return data;
  }

  applyChanges() {
    this.originalData = this.getData();
    this.restore();
  }

  restore() {
    this.changedData = <UnitDefinitionDto>{};
    this.notifyChange();
  }

  private notifyChange(): void {
    this.changedState.set(this.isChanged());
    this.dataChange.emit();
  }
}

import { UnitDefinitionDto } from '@studio-lite-lib/api-dto';
import {
  EventEmitter, Signal, signal, WritableSignal
} from '@angular/core';
import { sameVariableLists, VariableInfoInEitherSpelling } from '@studio-lite/shared-code';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';

type EditorReport = {
  variables: VariableInfoInEitherSpelling[];
  definition: string;
  definitionType?: string;
};

/**
 * The unit's definition while it is being worked on: what was loaded, and beside it the editor's
 * latest report. What is changed is what that report has that differs from what is saved, measured
 * again after each save: a report set back to the old state while the save was under way differs
 * from the state just saved (#2087). "Is there anything to save" is answered by whether anything
 * differs at all.
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
  private readonly dataState: WritableSignal<UnitDefinitionDto>;
  /** What {@link getData} answers, as a signal for whoever derives from it (#1361). */
  readonly data: Signal<UnitDefinitionDto>;
  private originalData: UnitDefinitionDto;
  private reported: EditorReport | undefined;
  // computed once per change: comparing the variables runs over the whole list
  private changedData: UnitDefinitionDto = {};
  private unitId: number;

  constructor(unitId: number, originalData: UnitDefinitionDto) {
    this.unitId = unitId;
    this.originalData = originalData;
    this.dataState = signal(this.getData());
    this.data = this.dataState.asReadonly();
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
    this.reported = { variables: newVariables, definition: newDefinition, definitionType: newDefinitionType };
    this.notifyChange();
  }

  private computeChangedData(): UnitDefinitionDto {
    const changes = <UnitDefinitionDto>{};
    if (!this.reported) return changes;
    if (!sameVariableLists(this.reported.variables, this.originalData.variables)) {
      // the DTO is typed with the 1.x spelling; the list is stored as reported
      changes.variables = this.reported.variables as VariableInfo[];
    }
    if (this.reported.definition !== this.originalData.definition) {
      changes.definition = this.reported.definition;
      if (this.reported.definitionType) changes.definitionType = this.reported.definitionType;
    }
    return changes;
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 0;
  }

  /** A copy: what is sent must not change with the edits made while it is under way (#1845). */
  getChangedData(): UnitDefinitionDto {
    return structuredClone(this.changedData);
  }

  getData(): UnitDefinitionDto {
    const data = { ...this.originalData, ...this.changedData };
    // a changed definition without a type of its own must not inherit the stored one
    if (this.changedData.definition !== undefined && !this.changedData.definitionType) {
      delete data.definitionType;
    }
    return data;
  }

  /**
   * Takes what was sent as saved. What the editor reported since then stays a change, as its latest
   * report is measured against the state now saved: nobody sent it yet, and taking it as saved lost
   * it (#1845).
   */
  applyChanges(sent: UnitDefinitionDto) {
    const saved = { ...this.originalData, ...sent };
    // as in getData: a definition sent without a type of its own does not keep the stored one
    if (sent.definition !== undefined && !sent.definitionType) delete saved.definitionType;
    this.originalData = saved;
    this.notifyChange();
  }

  restore() {
    this.reported = undefined;
    this.notifyChange();
  }

  private notifyChange(): void {
    this.changedData = this.computeChangedData();
    this.changedState.set(this.isChanged());
    this.dataState.set(this.getData());
    this.dataChange.emit();
  }
}

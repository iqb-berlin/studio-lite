import { UnitDefinitionDto } from '@studio-lite-lib/api-dto';
import { EventEmitter } from '@angular/core';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';

export class UnitDefinitionStore {
  dataChange: EventEmitter<void> = new EventEmitter<void>();
  private originalData: UnitDefinitionDto;
  private changedData: UnitDefinitionDto;
  private unitId: number;

  constructor(unitId: number, originalData: UnitDefinitionDto) {
    this.unitId = unitId;
    this.originalData = originalData;
    this.changedData = <UnitDefinitionDto>{};
  }

  setData(newVariables: VariableInfo[], newDefinition: string) {
    if (JSON.stringify(newVariables) === JSON.stringify(this.originalData.variables)) {
      if (this.changedData.variables) delete this.changedData.variables;
    } else {
      this.changedData.variables = newVariables;
    }
    if (newDefinition === this.originalData.definition) {
      if (this.changedData.definition) delete this.changedData.definition;
    } else {
      this.changedData.definition = newDefinition;
    }
    this.dataChange.emit();
  }

  isChanged(): boolean {
    return Object.keys(this.changedData).length > 0;
  }

  getChangedData(): UnitDefinitionDto {
    return this.changedData;
  }

  getData(): UnitDefinitionDto {
    return { ...this.originalData, ...this.changedData };
  }

  applyChanges() {
    this.originalData = this.getData();
    this.restore();
  }

  restore() {
    this.changedData = <UnitDefinitionDto>{};
    this.dataChange.emit();
  }
}

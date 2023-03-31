import { UnitSchemeDto } from '@studio-lite-lib/api-dto';

export class UnitSchemeStore {
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
    this.changedData = <UnitSchemeDto>{};
  }

  restore() {
    this.changedData = <UnitSchemeDto>{};
  }
}

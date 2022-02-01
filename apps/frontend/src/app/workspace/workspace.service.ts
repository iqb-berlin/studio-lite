import {
  BehaviorSubject, forkJoin, lastValueFrom, Observable, of
} from 'rxjs';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BackendService } from './backend.service';
import {UnitInListDto} from "@studio-lite-lib/api-dto";
import {ModuleCollection, UnitCollection, UnitDefinitionStore, UnitMetadataStore} from "./workspace.classes";

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  selectedWorkspace = 0;
  selectedUnit$ = new BehaviorSubject<number>(0);
  editorList = new ModuleCollection([]);
  playerList = new ModuleCollection([]);
  unitMetadataStore: UnitMetadataStore | undefined;
  unitDefinitionStore: UnitDefinitionStore | undefined;
  unitList = new UnitCollection([]);

  constructor(
    private bs: BackendService
  ) {}

  static unitKeyUniquenessValidator(unitId: number, unitList: UnitInListDto[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const newKeyNormalised = control.value.toUpperCase().trim();
      let isUnique = true;
      unitList.forEach(u => {
        if (u.key.toUpperCase().trim() === newKeyNormalised && u.id !== unitId) {
          isUnique = false;
        }
      });
      if (!isUnique) {
        return { keyNotUnique: 'Der Kurzname muss eindeutig innerhalb des Arbeitsbereiches sein.' };
      }
      return null;
    };
  }

  resetUnitData(): void {
    this.unitMetadataStore = undefined;
    this.unitDefinitionStore = undefined;
  }

  isChanged(): boolean {
    return !!((this.unitMetadataStore && this.unitMetadataStore.isChanged()) ||
      (this.unitDefinitionStore && this.unitDefinitionStore.isChanged()))
  }

  async saveUnitData(): Promise<boolean> {
    let reloadUnitList = false;
    let saveOk = true;
    if (this.unitMetadataStore && this.unitMetadataStore.isChanged()) {
      saveOk = await lastValueFrom(this.bs.setUnitMetadata(
        this.selectedWorkspace, this.unitMetadataStore.getChangedData()));
      if (saveOk) {
        reloadUnitList = this.unitMetadataStore.isKeyOrNameChanged();
        this.unitMetadataStore.applyChanges()
      }
    }
    if (saveOk && this.unitDefinitionStore && this.unitDefinitionStore.isChanged()) {
      saveOk = await lastValueFrom(this.bs.setUnitDefinition(
        this.selectedWorkspace, this.unitDefinitionStore.getChangedData()));
      if (saveOk) this.unitDefinitionStore.applyChanges();
    }
    if (reloadUnitList) {
      saveOk = await lastValueFrom(this.bs.getUnitList(this.selectedWorkspace)
          .pipe(
            map(uResponse => {
              this.unitList = new UnitCollection(uResponse);
              return true;
            })
          )
      )
    }
    return saveOk;
  }
}

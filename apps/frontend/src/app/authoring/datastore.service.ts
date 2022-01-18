import {
  BehaviorSubject, forkJoin, Observable, of
} from 'rxjs';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  BackendService, ModulData, UnitMetadata, UnitShortData
} from './backend.service';

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {
  selectedWorkspace = 0;
  selectedUnit$ = new BehaviorSubject<number>(0);
  editorList: { [key: string]: ModulData; } | null = null;
  defaultEditor = '';
  playerList: { [key: string]: ModulData; } | null = null;
  defaultPlayer = '';
  unitMetadataOld: { editorid: any; description: any; id: any; label: any; key: any; lastchanged: any; playerid: any } | null = null;
  unitMetadataNew: { editorid: any; description: any; id: any; label: any; key: any; lastchanged: any; playerid: any } | null = null;
  unitMetadataChanged = false;
  unitDefinitionOld = '';
  unitDefinitionNew = '';
  unitDefinitionChanged = false;
  unitList: UnitShortData[] = [];

  constructor(private bs: BackendService) {}

  static unitKeyUniquenessValidator(unitId: number, unitList: UnitShortData[]): ValidatorFn {
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

  static validModuleId(moduleId: string, moduleList: { [key: string]: ModulData; } | null): boolean | string {
    if (!moduleList) return false;
    if (moduleList[moduleId]) return true;
    const regexPattern = /^([A-Za-z0-9_-]+)@(\d+)\.(\d+)/;
    const matches1 = regexPattern.exec(moduleId);
    if (!matches1 || matches1.length !== 4) return false;
    let bestMatchId = '';
    let bestMatchMinor = +matches1[3];
    Object.keys(moduleList).forEach(k => {
      const matches2 = regexPattern.exec(k);
      if (matches2 && matches2.length === 4) {
        if ((matches2[1] === matches1[1]) && (matches2[2] === matches1[2])) {
          const minor = +matches2[3];
          if (minor > bestMatchMinor) {
            bestMatchMinor = minor;
            bestMatchId = k;
          }
        }
      }
    });
    if (bestMatchId) return bestMatchId;
    return false;
  }

  saveUnitData(): Observable<boolean> {
    if (this.unitMetadataNew && this.unitMetadataOld) {
      const reloadUnitList = (this.unitMetadataNew.key !== this.unitMetadataOld.key) ||
        (this.unitMetadataNew.label !== this.unitMetadataOld.label);
      const saveSubscriptions: Observable<number | boolean>[] = [];
      if (this.unitMetadataChanged) {
        saveSubscriptions.push(this.bs.setUnitMetadata(this.selectedWorkspace, this.unitMetadataNew));
      }
      if (this.unitDefinitionChanged) {
        saveSubscriptions.push(this.bs.setUnitDefinition(
          this.selectedWorkspace, this.unitMetadataNew.id, this.unitDefinitionNew
        ));
      }
      if (saveSubscriptions.length > 0) {
        return forkJoin(saveSubscriptions).pipe(
          switchMap(results => {
            let isFailing = false;
            results.forEach(r => {
              if (r !== true) isFailing = true;
            });
            if (isFailing) return of(false);
            if (this.unitMetadataNew) {
              this.unitMetadataNew.lastchanged = Math.round(Date.now() / 1000);
              this.unitMetadataOld = {
                id: this.unitMetadataNew.id,
                key: this.unitMetadataNew.key,
                label: this.unitMetadataNew.label,
                description: this.unitMetadataNew.description,
                editorid: this.unitMetadataNew.editorid,
                playerid: this.unitMetadataNew.playerid,
                lastchanged: this.unitMetadataNew.lastchanged
              };
            }
            this.unitMetadataChanged = false;
            this.unitDefinitionOld = this.unitDefinitionNew;
            this.unitDefinitionChanged = false;
            if (reloadUnitList) {
              return this.bs.getUnitList(this.selectedWorkspace)
                .pipe(
                  catchError(() => []),
                  map(uResponse => {
                    this.unitList = uResponse;
                    return true;
                  })
                );
            }
            return of(true);
          })
        );
      }
      return of(true);
    }
    return of(true);
  }

  setUnitDataChanged(): void {
    this.unitMetadataChanged = this.getUnitMetaDataChanged();
    this.unitDefinitionChanged = this.unitDefinitionNew !== this.unitDefinitionOld;
  }

  private getUnitMetaDataChanged(): boolean {
    if (this.unitMetadataOld && this.unitMetadataNew) {
      if (this.unitMetadataNew.key !== this.unitMetadataOld.key) return true;
      if (this.unitMetadataNew.label !== this.unitMetadataOld.label) return true;
      if (this.unitMetadataNew.description !== this.unitMetadataOld.description) return true;
      if (this.unitMetadataNew.editorid !== this.unitMetadataOld.editorid) return true;
      if (this.unitMetadataNew.playerid !== this.unitMetadataOld.playerid) return true;
    }
    return false;
  }
}

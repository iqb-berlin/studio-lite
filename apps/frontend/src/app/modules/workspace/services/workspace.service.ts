import {
  BehaviorSubject, lastValueFrom
} from 'rxjs';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import { UnitInListDto, UnitMetadataDto, WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { BackendService } from './backend.service';
import { BackendService as AppBackendService } from '../../../services/backend.service';
import {
  UnitMetadataStore
} from '../classes/unit-metadata-store';
import { AppService } from '../../../services/app.service';
import { UnitSchemeStore } from '../classes/unit-scheme-store';
import { UnitDefinitionStore } from '../classes/unit-definition-store';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  selectedWorkspaceId = 0;
  selectedWorkspaceName = '';
  selectedUnit$ = new BehaviorSubject<number>(0);
  workspaceSettings: WorkspaceSettingsDto;
  unitMetadataStore: UnitMetadataStore | undefined;
  unitDefinitionStore: UnitDefinitionStore | undefined;
  unitSchemeStore: UnitSchemeStore | undefined;
  unitList: { [key: string]: UnitInListDto[] } = {};
  isWorkspaceGroupAdmin = false;
  lastChangedMetadata?: Date;
  lastChangedDefinition?: Date;
  lastChangedScheme?: Date;
  isValidFormKey = new BehaviorSubject<boolean>(true);

  @Output() onCommentsUpdated = new EventEmitter<void>();
  @Output() unitDefinitionStoreChanged = new EventEmitter<void>();

  constructor(
    private backendService: BackendService,
    private appBackendService: AppBackendService,
    private appService: AppService
  ) {
    this.workspaceSettings = {
      defaultEditor: '',
      defaultPlayer: '',
      defaultSchemer: '',
      unitGroups: [],
      stableModulesOnly: true
    };
  }

  static unitKeyUniquenessValidator(unitId: number, unitList: { [key: string]: UnitInListDto[] }): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newKeyNormalised = control.value.toUpperCase().trim();
      let allUnits: UnitInListDto[] = [];
      Object.values(unitList).forEach(units => {
        allUnits = [...allUnits, ...units];
      });
      const allreadyIn = allUnits.filter(u => u.key.toUpperCase().trim() === newKeyNormalised && u.id !== unitId);
      if (allreadyIn && allreadyIn.length > 0) {
        return { keyNotUnique: 'Der Kurzname muss eindeutig innerhalb des Arbeitsbereiches sein.' };
      }
      return null;
    };
  }

  resetUnitData(): void {
    this.unitMetadataStore = undefined;
    this.lastChangedMetadata = undefined;
    this.unitDefinitionStore = undefined;
    this.lastChangedDefinition = undefined;
    this.unitSchemeStore = undefined;
    this.lastChangedScheme = undefined;
  }

  setUnitDefinitionStore(unitDefinitionStore: UnitDefinitionStore): void {
    this.unitDefinitionStore = unitDefinitionStore;
    this.unitDefinitionStoreChanged.emit();
  }

  // TODO: Remove usage fom unit-save-button template!
  isChanged(): boolean {
    return !!((this.unitMetadataStore && this.unitMetadataStore.isChanged()) ||
      (this.unitDefinitionStore && this.unitDefinitionStore.isChanged()) ||
      (this.unitSchemeStore && this.unitSchemeStore.isChanged())
    );
  }

  resetUnitList(data: UnitInListDto[]) {
    this.unitList = {};
    data.forEach(u => {
      const groupName = u.groupName ? u.groupName : '';
      if (this.unitList[groupName]) {
        this.unitList[groupName].push(u);
      } else {
        this.unitList[groupName] = [u];
      }
    });
  }

  async loadUnitMetadata(): Promise<UnitMetadataStore | undefined> {
    if (this.unitMetadataStore) return this.unitMetadataStore;
    const selectedUnitId = this.selectedUnit$.getValue();
    return lastValueFrom(this.backendService.getUnitMetadata(this.selectedWorkspaceId, selectedUnitId)
      .pipe(
        map(unitData => {
          this.lastChangedMetadata = undefined;
          this.lastChangedDefinition = undefined;
          this.lastChangedScheme = undefined;
          // explicit Date object due to timezone
          if (unitData) {
            if (unitData.lastChangedMetadata) {
              unitData.lastChangedMetadata = new Date(unitData.lastChangedMetadata);
              this.lastChangedMetadata = new Date(unitData.lastChangedMetadata);
            }
            if (unitData.lastChangedDefinition) {
              unitData.lastChangedDefinition = new Date(unitData.lastChangedDefinition);
              this.lastChangedDefinition = new Date(unitData.lastChangedDefinition);
            }
            if (unitData.lastChangedScheme) {
              unitData.lastChangedScheme = new Date(unitData.lastChangedScheme);
              this.lastChangedScheme = new Date(unitData.lastChangedScheme);
            }
            this.unitMetadataStore = new UnitMetadataStore(unitData);
          } else {
            this.unitMetadataStore = new UnitMetadataStore(<UnitMetadataDto>{ id: selectedUnitId });
          }
          return this.unitMetadataStore;
        })
      ));
  }

  async saveUnitData(): Promise<boolean> {
    let reloadUnitList = false;
    let saveOk = true;
    this.appService.dataLoading = true;
    if (this.unitMetadataStore && this.unitMetadataStore.isChanged()) {
      saveOk = await lastValueFrom(this.backendService.setUnitMetadata(
        this.selectedWorkspaceId, this.unitMetadataStore.getChangedData()
      ));
      if (saveOk) {
        reloadUnitList = this.unitMetadataStore.isKeyOrNameOrGroupChanged();
        this.unitMetadataStore.applyChanges();
        this.lastChangedMetadata = new Date();
      }
    }
    if (saveOk && this.unitDefinitionStore && this.unitDefinitionStore.isChanged()) {
      saveOk = await lastValueFrom(this.backendService.setUnitDefinition(
        this.selectedWorkspaceId, this.selectedUnit$.getValue(), this.unitDefinitionStore.getChangedData()
      ));
      if (saveOk) {
        this.unitDefinitionStore.applyChanges();
        this.lastChangedDefinition = new Date();
      }
    }
    if (saveOk && this.unitSchemeStore && this.unitSchemeStore.isChanged()) {
      saveOk = await lastValueFrom(this.backendService.setUnitScheme(
        this.selectedWorkspaceId, this.selectedUnit$.getValue(), this.unitSchemeStore.getChangedData()
      ));
      if (saveOk) {
        this.unitSchemeStore.applyChanges();
        this.lastChangedScheme = new Date();
      }
    }
    if (reloadUnitList) {
      saveOk = await lastValueFrom(this.backendService.getUnitList(this.selectedWorkspaceId)
        .pipe(
          map(uResponse => {
            this.resetUnitList(uResponse);
            this.appService.dataLoading = false;
            return true;
          })
        ));
    }
    this.appService.dataLoading = false;
    return saveOk;
  }
}

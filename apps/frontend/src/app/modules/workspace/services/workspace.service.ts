import {
  BehaviorSubject, lastValueFrom
} from 'rxjs';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import {
  UnitInListDto, UnitPropertiesDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { HttpParams } from '@angular/common/http';
import { CodingScheme } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { WorkspaceBackendService } from './workspace-backend.service';
import {
  UnitMetadataStore
} from '../classes/unit-metadata-store';
import { AppService } from '../../../services/app.service';
import { UnitSchemeStore } from '../classes/unit-scheme-store';
import { UnitDefinitionStore } from '../classes/unit-definition-store';
import { State } from '../../admin/models/state.type';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  unitMetadataStore: UnitMetadataStore | undefined;
  private unitDefinitionStore: UnitDefinitionStore | undefined;
  private unitSchemeStore: UnitSchemeStore | undefined;
  groupId!: number;
  selectedWorkspaceId = 0;
  selectedWorkspaceName = '';
  selectedUnit$ = new BehaviorSubject<number>(0);
  workspaceSettings: WorkspaceSettingsDto;
  unitList: { [key: string]: UnitInListDto[] } = {};
  isWorkspaceGroupAdmin = false;
  userAccessLevel = 0;
  lastChangedMetadata?: Date;
  lastChangedDefinition?: Date;
  lastChangedScheme?: Date;
  lastChangedMetadataUser?: string;
  lastChangedDefinitionUser?: string;
  lastChangedSchemeUser?: string;
  isValidFormKey = new BehaviorSubject<boolean>(true);
  states: State[] = [];
  codingScheme!: CodingScheme;
  dropBoxId: number | null = null;
  hasDroppedUnits: boolean = false;

  @Output() onCommentsUpdated = new EventEmitter<void>();
  @Output() unitDefinitionStoreChanged = new EventEmitter<UnitDefinitionStore | undefined>();
  @Output() unitMetadataStoreChanged = new EventEmitter<UnitMetadataStore | undefined>();
  @Output() unitSchemeStoreChanged = new EventEmitter<UnitSchemeStore | undefined>();
  @Output() unitPropertiesChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private backendService: WorkspaceBackendService,
    private appService: AppService
  ) {
    this.workspaceSettings = {
      defaultEditor: '',
      defaultPlayer: '',
      defaultSchemer: '',
      unitGroups: [],
      stableModulesOnly: true,
      itemMDProfile: '',
      unitMDProfile: ''
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
    this.lastChangedMetadata = undefined;
    this.lastChangedScheme = undefined;
    this.lastChangedDefinition = undefined;
    this.setUnitSchemeStore(undefined);
    this.setUnitMetadataStore(undefined);
    this.setUnitDefinitionStore(undefined);
  }

  setUnitDefinitionStore(unitDefinitionStore: UnitDefinitionStore | undefined): void {
    this.unitDefinitionStore = unitDefinitionStore;
    this.unitDefinitionStoreChanged.emit(unitDefinitionStore);
  }

  getUnitDefinitionStore(): UnitDefinitionStore | undefined {
    return this.unitDefinitionStore;
  }

  setUnitSchemeStore(unitSchemeStore: UnitSchemeStore | undefined): void {
    this.unitSchemeStore = unitSchemeStore;
    this.unitSchemeStoreChanged.emit(unitSchemeStore);
  }

  getUnitSchemeStore(): UnitSchemeStore | undefined {
    return this.unitSchemeStore;
  }

  setUnitMetadataStore(unitMetadataStore: UnitMetadataStore | undefined): void {
    this.unitMetadataStore = unitMetadataStore;
    this.unitMetadataStoreChanged.emit(unitMetadataStore);
  }

  getUnitMetadataStore(): UnitMetadataStore | undefined {
    return this.unitMetadataStore;
  }

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

  setWorkspaceGroupStates(): void {
    if (this.groupId) {
      this.backendService.getWorkspaceGroupStates(this.groupId).subscribe(res => {
        if (res.settings) {
          this.workspaceSettings.states = res.settings.states;
          this.states = res.settings.states || [];
        }
      });
    }
  }

  async loadUnitProperties(): Promise<UnitMetadataStore | undefined> {
    if (this.unitMetadataStore) return this.unitMetadataStore;
    const selectedUnitId = this.selectedUnit$.getValue();
    return lastValueFrom(this.backendService.getUnitProperties(this.selectedWorkspaceId, selectedUnitId)
      .pipe(
        map(unitData => {
          this.lastChangedMetadata = undefined;
          this.lastChangedDefinition = undefined;
          this.lastChangedScheme = undefined;
          this.lastChangedMetadataUser = undefined;
          this.lastChangedDefinitionUser = undefined;
          this.lastChangedSchemeUser = undefined;
          // explicit Date object due to timezone
          if (unitData) {
            if (unitData.lastChangedMetadata) {
              unitData.lastChangedMetadata = new Date(unitData.lastChangedMetadata);
              this.lastChangedMetadata = new Date(unitData.lastChangedMetadata);
              this.lastChangedMetadataUser = unitData.lastChangedMetadataUser;
            }
            if (unitData.lastChangedDefinition) {
              unitData.lastChangedDefinition = new Date(unitData.lastChangedDefinition);
              this.lastChangedDefinition = new Date(unitData.lastChangedDefinition);
              this.lastChangedDefinitionUser = unitData.lastChangedDefinitionUser;
            }
            if (unitData.lastChangedScheme) {
              unitData.lastChangedScheme = new Date(unitData.lastChangedScheme);
              this.lastChangedScheme = new Date(unitData.lastChangedScheme);
              this.lastChangedSchemeUser = unitData.lastChangedSchemeUser;
            }
            this.setUnitMetadataStore(new UnitMetadataStore(unitData));
          } else {
            this.setUnitMetadataStore(new UnitMetadataStore(<UnitPropertiesDto>{ id: selectedUnitId }));
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
      saveOk = await lastValueFrom(this.backendService.setUnitProperties(
        this.selectedWorkspaceId, this.unitMetadataStore.getChangedData()
      ));
      if (saveOk) {
        reloadUnitList = this.unitMetadataStore.isKeyOrNameOrGroupOrStateChanged();
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
      let queryParams = new HttpParams();
      queryParams = queryParams
        .append('targetWorkspaceId', this.selectedWorkspaceId)
        .append('withLastSeenCommentTimeStamp', true);
      saveOk = await lastValueFrom(this.backendService.getUnitList(this.selectedWorkspaceId, queryParams)
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

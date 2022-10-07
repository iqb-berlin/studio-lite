import {
  BehaviorSubject, lastValueFrom
} from 'rxjs';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import { UnitInListDto, UnitMetadataDto, WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { DatePipe } from '@angular/common';
import { BackendService } from './backend.service';
import {
  UnitCollection, UnitDefinitionStore, UnitMetadataStore, UnitSchemeStore
} from './workspace.classes';
import { AppService } from '../app.service';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  selectedWorkspaceId = 0;
  selectedWorkspaceName = '';
  selectedUnit$ = new BehaviorSubject<number>(0);
  workspaceSettings: WorkspaceSettingsDto;
  moduleHtmlStore: { [key: string]: string } = {};
  unitMetadataStore: UnitMetadataStore | undefined;
  unitDefinitionStore: UnitDefinitionStore | undefined;
  unitSchemeStore: UnitSchemeStore | undefined;
  unitList = new UnitCollection([]);
  isWorkspaceGroupAdmin = false;
  lastChangedMetadata?: Date;
  lastChangedDefinition?: Date;
  lastChangedScheme?: Date;
  unitLastChanged: Date | undefined;
  unitLastChangedText = '';
  @Output() onCommentsUpdated = new EventEmitter<void>()

  constructor(
    private backendService: BackendService,
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

  static unitKeyUniquenessValidator(unitId: number, unitList: UnitInListDto[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
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
    this.lastChangedMetadata = undefined;
    this.unitDefinitionStore = undefined;
    this.lastChangedDefinition = undefined;
    this.unitSchemeStore = undefined;
    this.lastChangedScheme = undefined;
    this.unitLastChanged = undefined;
    this.unitLastChangedText = '';
  }

  isChanged(): boolean {
    return !!((this.unitMetadataStore && this.unitMetadataStore.isChanged()) ||
      (this.unitDefinitionStore && this.unitDefinitionStore.isChanged()) ||
      (this.unitSchemeStore && this.unitSchemeStore.isChanged())
    );
  }

  async getModuleHtml(key: string): Promise<string | null> {
    if (Object.keys(this.moduleHtmlStore).indexOf(key) >= 0) return this.moduleHtmlStore[key];
    this.appService.dataLoading = true;
    const fileData = await lastValueFrom(this.backendService.getModuleHtml(key));
    this.appService.dataLoading = false;
    if (fileData) {
      this.moduleHtmlStore[key] = fileData.file;
      return this.moduleHtmlStore[key];
    }
    return null;
  }

  async loadUnitMetadata(): Promise<UnitMetadataStore | undefined> {
    if (this.unitMetadataStore) return this.unitMetadataStore;
    const selectedUnitId = this.selectedUnit$.getValue();
    return lastValueFrom(this.backendService.getUnitMetadata(this.selectedWorkspaceId, selectedUnitId)
      .pipe(
        map(unitData => {
          this.unitMetadataStore = new UnitMetadataStore(
            unitData || <UnitMetadataDto>{ id: selectedUnitId }
          );
          // explicit Date object due to timezone
          this.lastChangedMetadata = unitData && unitData.lastChangedMetadata ?
            new Date(unitData.lastChangedMetadata) : undefined;
          this.lastChangedDefinition = unitData && unitData.lastChangedDefinition ?
            new Date(unitData.lastChangedDefinition) : undefined;
          this.lastChangedScheme = unitData && unitData.lastChangedScheme ?
            new Date(unitData.lastChangedScheme) : undefined;
          this.setUnitLastChanged();
          return this.unitMetadataStore;
        })
      ));
  }

  setUnitLastChanged() {
    let last: Date | undefined;
    if (this.lastChangedMetadata) last = this.lastChangedMetadata;
    if (this.lastChangedDefinition && (!last || this.lastChangedDefinition > last)) last = this.lastChangedDefinition;
    if (this.lastChangedScheme && (!last || this.lastChangedScheme > last)) last = this.lastChangedScheme;
    this.unitLastChanged = last;
    const datePipe = new DatePipe('de-DE');
    this.unitLastChangedText = `Eigenschaften: ${this.lastChangedMetadata ? datePipe.transform(this.lastChangedMetadata, 'dd.MM.yyyy HH:mm') : '-'}
Definition:  ${this.lastChangedDefinition ? datePipe.transform(this.lastChangedDefinition, 'dd.MM.yyyy HH:mm') : '-'}
Kodierschema:  ${this.lastChangedScheme ? datePipe.transform(this.lastChangedScheme, 'dd.MM.yyyy HH:mm') : '-'}`;
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
            this.unitList = new UnitCollection(uResponse);
            this.appService.dataLoading = false;
            return true;
          })
        ));
    }
    this.appService.dataLoading = false;
    this.setUnitLastChanged();
    return saveOk;
  }
}

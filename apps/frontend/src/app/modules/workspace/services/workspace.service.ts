import {
  BehaviorSubject, lastValueFrom
} from 'rxjs';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import {
  MetadataProfileDto,
  TopConcept,
  UnitInListDto, UnitPropertiesDto
} from '@studio-lite-lib/api-dto';
import { HttpParams } from '@angular/common/http';
import { CodingScheme } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { WorkspaceBackendService } from './workspace-backend.service';
import { MDProfile } from '@iqb/metadata';
import { MDProfile, MDProfileGroup } from '@iqb/metadata';
import { ProfileEntryParametersVocabulary } from '@iqb/metadata/md-profile-entry';
import {
  Vocab,
  VocabData,
  VocabIdDictionaryValue
} from '@iqb/ngx-metadata-components/lib/models/vocabulary.class';
import { BackendService } from './backend.service';
import {
  UnitMetadataStore
} from '../classes/unit-metadata-store';
import { AppService } from '../../../services/app.service';
import { UnitSchemeStore } from '../classes/unit-scheme-store';
import { UnitDefinitionStore } from '../classes/unit-definition-store';
import { State } from '../../admin/models/state.type';
import { WorkspaceSettings } from '../../wsg-admin/models/workspace-settings.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private workspaceSettingsSubject = new BehaviorSubject<WorkspaceSettings | null>(null);
  workspaceSettings$ = this.workspaceSettingsSubject.asObservable();

  set workspaceSettings(settings: WorkspaceSettings | null) {
    this.workspaceSettingsSubject.next(settings);
  }

  get workspaceSettings(): WorkspaceSettings | null {
    return this.workspaceSettingsSubject.value;
  }

  private unitMetadataStore: UnitMetadataStore | undefined;
  private unitDefinitionStore: UnitDefinitionStore | undefined;
  private unitSchemeStore: UnitSchemeStore | undefined;
  private vocabulariesSubject = new BehaviorSubject<Vocab[]>([]);
  vocabularies$ = this.vocabulariesSubject.asObservable(); // Observable für Subscribers

  // Getter für aktuelle Werte
  get vocabularies(): Vocab[] {
    return this.vocabulariesSubject.value;
  }

  // Setter, um Änderungen zu benachrichtigen
  set vocabularies(newVocabularies: Vocab[]) {
    this.vocabulariesSubject.next(newVocabularies);
  }

  groupId!: number;
  selectedWorkspaceId = 0;
  selectedWorkspaceName = '';
  selectedUnit$ = new BehaviorSubject<number>(0);
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
  itemProfile!: MDProfile;
  unitProfile!: MDProfile;
  vocabulariesIdDictionary: Record<string, VocabIdDictionaryValue> = {};
  idLabelDictionary: Record<string, VocabIdDictionaryValue> = {};
  unitProfileColumns:MDProfileGroup[] = [];
  itemProfileColumns:MDProfileGroup = {} as MDProfileGroup;

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

  async getProfile(profileUrl: string, profileType: string): Promise<MetadataProfileDto | null> {
    try {
      const profile = await lastValueFrom(this.backendService.getMetadataProfile(profileUrl));
      if (!profile) {
        return null;
      }
      if (profileType === 'item') {
        this.itemProfile = new MDProfile(profile);
      } else {
        this.unitProfile = new MDProfile(profile);
      }
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async loadProfileVocabularies(profile: MDProfile): Promise<Vocab[] | boolean> {
    return new Promise(resolve => {
      this.backendService.getMetadataVocabulariesForProfile(profile.id)
        .subscribe(metadataVocabularies => {
          if (metadataVocabularies && metadataVocabularies !== true &&
            !metadataVocabularies.some(vocabulary => vocabulary === null)) {
            const vocabularies: Vocab[] = metadataVocabularies
              .map(vocabulary => ({
                data: vocabulary,
                url: vocabulary.id
              }));
            if (this.vocabularies.length) {
              this.vocabularies = [...this.vocabularies, ...vocabularies];
            } else {
              this.vocabularies = vocabularies;
            }

            const vocabularyEntryParams = profile.groups
              .flatMap(group => group.entries)
              .filter(entry => (entry.type === 'vocabulary'))
              .map(entry => (entry.parameters as unknown as ProfileEntryParametersVocabulary));
            vocabularyEntryParams.forEach(entryParam => {
              const matchingVocabulary = this.vocabularies.find(vocabulary => vocabulary.url === entryParam.url);
              if (matchingVocabulary) {
                this.vocabulariesIdDictionary = {
                  ...this.vocabulariesIdDictionary,
                  ...this.mapVocabularyIds(matchingVocabulary.data, entryParam)
                };
              }
            });
            resolve(true);
          }
          resolve(false);
        });
    });
  }

  private mapVocabularyIds(vocabulary: VocabData, entryParams: ProfileEntryParametersVocabulary) {
    const hasNarrower = (narrower: TopConcept[]) => {
      narrower.forEach((vocabularyEntry: TopConcept) => {
        this.idLabelDictionary[vocabularyEntry.id] = {
          labels: vocabularyEntry.prefLabel,
          notation: vocabularyEntry.notation || [],
          ...entryParams
        };
        if (vocabularyEntry.narrower) hasNarrower(vocabularyEntry.narrower);
      });
    };

    if (vocabulary.hasTopConcept) {
      vocabulary.hasTopConcept.forEach((topConcept: TopConcept) => {
        this.idLabelDictionary[topConcept.id] = {
          labels: topConcept.prefLabel, notation: topConcept.notation || [], ...entryParams
        };
        if (topConcept.narrower) hasNarrower(topConcept.narrower);
      });
    }
    return this.idLabelDictionary;
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
    if (!this.groupId) {
      return;
    }

    this.backendService.getWorkspaceGroupStates(this.groupId).subscribe(res => {
      const newStates = res.settings?.states;
      if (newStates && this.workspaceSettings) {
        this.workspaceSettings.states = newStates;
        this.states = newStates;
      }
    });
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
      const queryParams = new HttpParams()
        .set('targetWorkspaceId', this.selectedWorkspaceId)
        .set('withLastSeenCommentTimeStamp', true);

      try {
        const unitListResponse = await lastValueFrom(
          this.backendService.getUnitList(this.selectedWorkspaceId, queryParams).pipe(
            map(uResponse => {
              this.resetUnitList(uResponse);
              this.appService.dataLoading = false;
              return true;
            })
          )
        );
        saveOk = unitListResponse;
      } catch (error) {
        console.error('Error loading unit list:', error);
      }
    }

    this.appService.dataLoading = false;
    return saveOk;
  }
}

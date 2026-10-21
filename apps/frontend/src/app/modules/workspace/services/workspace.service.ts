import {
  BehaviorSubject, lastValueFrom, Observable
} from 'rxjs';
import {
  EventEmitter, Injectable, Output, signal
} from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import {
  State,
  UnitInListDto,
  UnitPropertiesDto,
  WorkspaceSettingsDto,
  UnitRichNoteTagDto
} from '@studio-lite-lib/api-dto';
import { HttpParams } from '@angular/common/http';
import { WorkspaceBackendService } from './workspace-backend.service';
import { UnitMetadataStore } from '../classes/unit-metadata-store';
import { AppService } from '../../../services/app.service';
import { RichNoteTagsService } from './rich-note-tags.service';
import { UnitStoresService } from './unit-stores.service';
import { reconcileItemVariables } from '../utils/item-variables.utils';

/**
 * The state of the workspace currently open: which unit is selected, what the user may do in it,
 * and what happens to the selected unit as a whole -- loading it, letting go of it, saving it.
 *
 * The unit's parts while they are being edited live in the stores of {@link UnitStoresService}:
 * a component that shows a unit reads from them and writes back into them, and only the save here
 * writes to the server. That is also why leaving a unit asks the stores whether anything is unsaved.
 */
@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  groupId!: number;
  selectedWorkspaceId = 0;
  selectedWorkspaceName = '';
  selectedUnit$ = new BehaviorSubject<number>(0);
  workspaceSettings: WorkspaceSettingsDto;
  unitList: { [key: string]: UnitInListDto[] } = {};
  private _isWorkspaceGroupAdmin = new BehaviorSubject<boolean>(false);
  private _userAccessLevel = new BehaviorSubject<number>(0);

  get isWorkspaceGroupAdmin(): boolean {
    return this._isWorkspaceGroupAdmin.getValue();
  }

  set isWorkspaceGroupAdmin(value: boolean) {
    this._isWorkspaceGroupAdmin.next(value);
  }

  get isWorkspaceGroupAdmin$(): Observable<boolean> {
    return this._isWorkspaceGroupAdmin.asObservable();
  }

  get userAccessLevel(): number {
    return this._userAccessLevel.getValue();
  }

  set userAccessLevel(value: number) {
    this._userAccessLevel.next(value);
  }

  get userAccessLevel$(): Observable<number> {
    return this._userAccessLevel.asObservable();
  }

  lastChangedMetadata?: Date;
  lastChangedDefinition?: Date;
  lastChangedScheme?: Date;
  lastChangedMetadataUser?: string;
  lastChangedDefinitionUser?: string;
  lastChangedSchemeUser?: string;
  isValidFormKey = new BehaviorSubject<boolean>(true);
  private readonly unitKeyTakenState = signal(false);
  /**
   * Whether another unit of the workspace already carries the key typed in the properties. Unlike
   * a key that only breaks the format rules -- which units in use do, and must stay savable -- a
   * taken key blocks saving (#1842).
   */
  readonly unitKeyTaken = this.unitKeyTakenState.asReadonly();
  private readonly savingState = signal(false);
  /** Whether the open unit is being saved; no second save starts meanwhile (#1845). */
  readonly saving = this.savingState.asReadonly();
  private runningSave: Promise<boolean> | undefined;
  states: State[] = [];
  dropBoxId: number | null = null;
  hasDroppedUnits: boolean = false;

  get richNoteTags(): UnitRichNoteTagDto[] {
    return this.richNoteTagsService.tags;
  }

  get richNoteTags$(): Observable<UnitRichNoteTagDto[]> {
    return this.richNoteTagsService.tags$;
  }

  @Output() onCommentsUpdated = new EventEmitter<void>();
  @Output() unitMetadataReloaded = new EventEmitter<void>();

  constructor(
    private backendService: WorkspaceBackendService,
    private appService: AppService,
    private richNoteTagsService: RichNoteTagsService,
    private unitStores: UnitStoresService
  ) {
    this.unitStores.metadataLoaded$.subscribe(unitData => this.setLastChanged(unitData));
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

  static unitKeyPatternString(): string {
    return '[a-zA-Z][a-zA-Z0-9_-]*';
  }

  /**
   * The list is asked for each time the key is checked rather than handed over once: `resetUnitList`
   * replaces the list object, so one taken when the form was built may be the empty list of a
   * workspace still loading, and no key would ever count as taken (#1842).
   */
  static unitKeyUniquenessValidator(
    unitId: number,
    unitList: () => { [key: string]: UnitInListDto[] }
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newKeyNormalised = control.value.toUpperCase().trim();
      let allUnits: UnitInListDto[] = [];
      Object.values(unitList()).forEach(units => {
        allUnits = [...allUnits, ...units];
      });
      const allreadyIn = allUnits.filter(
        u => u.key.toUpperCase().trim() === newKeyNormalised && u.id !== unitId
      );
      if (allreadyIn && allreadyIn.length > 0) {
        return {
          keyNotUnique:
            'Der Kurzname muss eindeutig innerhalb des Arbeitsbereiches sein.'
        };
      }
      return null;
    };
  }

  resetUnitData(): void {
    this.lastChangedMetadata = undefined;
    this.lastChangedScheme = undefined;
    this.lastChangedDefinition = undefined;
    // the key checks belong to the unit left; the next one is checked when its properties are shown
    this.isValidFormKey.next(true);
    this.unitKeyTakenState.set(false);
    this.unitStores.reset();
  }

  setUnitKeyTaken(taken: boolean): void {
    this.unitKeyTakenState.set(taken);
  }

  resetUnitList(data: UnitInListDto[]) {
    this.unitList = {};
    const unitGroups = [...this.workspaceSettings.unitGroups || []];
    const usedUnitGroups: string[] = [];
    data.forEach(u => {
      const groupName = u.groupName ? u.groupName : '';
      if (groupName && !usedUnitGroups.includes(groupName)) {
        usedUnitGroups.push(groupName);
      }
      if (this.unitList[groupName]) {
        this.unitList[groupName].push(u);
      } else {
        this.unitList[groupName] = [u];
      }
    });
    const notUsedGroups = unitGroups.filter(g => !usedUnitGroups.includes(g));
    notUsedGroups.forEach(groupName => this.addEmptyUnitGroup(groupName));
  }

  private addEmptyUnitGroup(groupName: string) {
    if (!this.unitList[groupName]) {
      this.unitList[groupName] = [];
    }
  }

  setWorkspaceGroupStates(): void {
    if (this.groupId) {
      this.backendService
        .getWorkspaceGroupStates(this.groupId)
        .subscribe(res => {
          if (res.settings) {
            this.workspaceSettings.states = res.settings.states;
            this.states = res.settings.states || [];
            this.workspaceSettings.richNoteTags = res.settings.richNoteTags;
          }
        });
    }
  }

  loadUnitProperties(): Observable<UnitMetadataStore | undefined> {
    return this.unitStores.loadMetadataStore(this.selectedWorkspaceId, this.selectedUnit$.getValue());
  }

  /** Who changed which part of the unit when, as the server reports it with freshly loaded properties. */
  private setLastChanged(unitData: UnitPropertiesDto): void {
    this.lastChangedMetadata = unitData.lastChangedMetadata ? new Date(unitData.lastChangedMetadata) : undefined;
    this.lastChangedMetadataUser = unitData.lastChangedMetadata ? unitData.lastChangedMetadataUser : undefined;
    this.lastChangedDefinition = unitData.lastChangedDefinition ? new Date(unitData.lastChangedDefinition) : undefined;
    this.lastChangedDefinitionUser = unitData.lastChangedDefinition ? unitData.lastChangedDefinitionUser : undefined;
    this.lastChangedScheme = unitData.lastChangedScheme ? new Date(unitData.lastChangedScheme) : undefined;
    this.lastChangedSchemeUser = unitData.lastChangedScheme ? unitData.lastChangedSchemeUser : undefined;
  }

  private getDisplayUserName(): string {
    return this.appService.authData.userLongName || this.appService.authData.userName;
  }

  /**
   * Saves the open unit. Asked again while a save is under way -- "save" in the dialog on leaving
   * the unit -- it does not start a second one beside it, which sent the same new items twice
   * (#1845). It waits for that save, and saves afterwards what was edited meanwhile and so was not
   * part of it.
   */
  saveUnitData(): Promise<boolean> {
    if (this.runningSave) {
      return this.runningSave.then(saved => (saved && this.unitStores.changed() ? this.saveUnitData() : saved));
    }
    this.savingState.set(true);
    this.runningSave = this.saveStores().finally(() => {
      this.runningSave = undefined;
      this.savingState.set(false);
    });
    return this.runningSave;
  }

  /**
   * Sends what each store holds at the start and takes exactly that as saved: what is edited while
   * the requests are under way stays a change for the next save (#1845).
   */
  private async saveStores(): Promise<boolean> {
    let reloadUnitList = false;
    let saveOk = true;
    this.appService.dataLoading = true;
    // the unit and its stores as they are when the save starts; another unit may be opened meanwhile
    const unitId = this.selectedUnit$.getValue();
    const unitMetadataStore = this.unitStores.metadataStore();
    const unitDefinitionStore = this.unitStores.definitionStore();
    const unitSchemeStore = this.unitStores.schemeStore();
    if (unitMetadataStore && (unitDefinitionStore?.isChanged() || unitSchemeStore?.isChanged())) {
      await this.reconcileItemVariables(unitMetadataStore, unitId);
    }
    if (unitMetadataStore && unitMetadataStore.isChanged()) {
      const changedData = unitMetadataStore.getChangedData();
      saveOk = await lastValueFrom(
        this.backendService.setUnitProperties(
          this.selectedWorkspaceId,
          changedData
        )
      );
      if (saveOk) {
        reloadUnitList = unitMetadataStore.isKeyOrNameOrGroupOrStateChanged();
        unitMetadataStore.applyChanges(changedData);
        this.lastChangedMetadata = new Date();
        this.lastChangedMetadataUser = this.getDisplayUserName();
        if (changedData.metadata?.items?.some(item => !item.uuid)) {
          await this.reloadUnitMetadata(changedData.id);
        }
      }
    }
    if (
      saveOk &&
      unitDefinitionStore &&
      unitDefinitionStore.isChanged()
    ) {
      const sentDefinition = unitDefinitionStore.getChangedData();
      saveOk = await lastValueFrom(
        this.backendService.setUnitDefinition(
          this.selectedWorkspaceId,
          unitId,
          sentDefinition
        )
      );
      if (saveOk) {
        unitDefinitionStore.applyChanges(sentDefinition);
        this.lastChangedDefinition = new Date();
        this.lastChangedDefinitionUser = this.getDisplayUserName();
      }
    }
    if (saveOk && unitSchemeStore && unitSchemeStore.isChanged()) {
      const sentScheme = unitSchemeStore.getChangedData();
      saveOk = await lastValueFrom(
        this.backendService.setUnitScheme(
          this.selectedWorkspaceId,
          unitId,
          sentScheme
        )
      );
      if (saveOk) {
        unitSchemeStore.applyChanges(sentScheme);
        this.lastChangedScheme = new Date();
        this.lastChangedSchemeUser = this.getDisplayUserName();
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

  /**
   * When the definition or the scheme is saved, the items' variables are brought in line with the
   * unit's variables in the same save: until now that happened only while the properties were open,
   * and the stored metadata kept an alias renamed or a variable removed elsewhere (#1361). It is done
   * only with the whole list -- the scheme loaded, the list not empty, the stores still this unit's --
   * since an incomplete list would remove assignments to variables that do exist.
   */
  private async reconcileItemVariables(unitMetadataStore: UnitMetadataStore, unitId: number): Promise<void> {
    const unitSchemeStore = await lastValueFrom(
      this.unitStores.loadSchemeStore(this.selectedWorkspaceId, unitId),
      { defaultValue: undefined }
    );
    const variables = this.unitStores.variables();
    const metadata = unitMetadataStore.getData().metadata;
    if (!unitSchemeStore || !variables.length || !metadata) return;
    if (this.unitStores.metadataStore() !== unitMetadataStore) return;
    const reconciled = reconcileItemVariables(metadata, variables);
    if (reconciled) unitMetadataStore.setMetadata(reconciled);
  }

  /**
   * Items that a save has just created get their uuid on the server only. Reading the metadata back
   * hands it to the store and, via {@link unitMetadataReloaded}, to the form, so that the next save
   * names these items as existing ones; named as new, the server would delete and recreate them
   * (#1830). If the user has meanwhile moved to another unit, its store is left alone.
   */
  private async reloadUnitMetadata(unitId: number): Promise<void> {
    const unitData = await lastValueFrom(
      this.backendService.getUnitProperties(this.selectedWorkspaceId, unitId)
    );
    const unitMetadataStore = this.unitStores.metadataStore();
    if (unitData && unitMetadataStore?.getData().id === unitId) {
      unitMetadataStore.reloadMetadata(unitData.metadata ?? {});
      this.unitMetadataReloaded.emit();
    }
  }

  loadRichNoteTags(): void {
    this.richNoteTagsService.loadTags(this.groupId);
  }

  getRichNoteTagLabel(tagId: string): { lang: string, value: string }[] {
    return this.richNoteTagsService.getTagLabel(tagId);
  }
}

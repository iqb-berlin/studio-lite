import {
  Component, OnDestroy, signal, ViewChild
} from '@angular/core';
import {
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  BehaviorSubject, EMPTY, Subject, Subscription, switchMap, takeUntil
} from 'rxjs';
import {
  State,
  UnitMetadataValues,
  UnitPropertiesDto,
  WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent
} from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { MDProfile } from '@iqbspecs/metadata-profile';
import { ProfileFormComponent, UnitMetadataValues as IqbUnitMetadataValues } from '@iqb/metadata-components';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ConfirmDialogComponent } from '@studio-lite-lib/iqb-components';
import { NewGroupButtonComponent } from '../new-group-button/new-group-button.component';
import { ItemsComponent } from '../../../metadata/components/items/items.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { SelectModuleComponent } from '../../../../components/select-module/select-module.component';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { ModuleService } from '../../../../services/module.service';
import { RequestMessageDirective } from '../../directives/request-message.directive';
import { CanReturnUnitPipe } from '../../pipes/can-return-unit.pipe';
import { AliasId } from '../../../metadata/models/alias-id.interface';
import { MetadataBackendService } from '../../../metadata/services/metadata-backend.service';
import { MetadataService } from '../../../metadata/services/metadata.service';
import { I18nService } from '../../../../services/i18n.service';

/**
 * Everything about a unit that is not its content: name and key, the modules it is opened with, its
 * state and group, its transcript and reference -- and its metadata, which is edited in the profile
 * form below the rest.
 *
 * The form writes into the unit's stores rather than to the server; saving is a separate act, and
 * leaving the unit with unsaved changes is what the guard asks about.
 */
@Component({
  templateUrl: './unit-properties.component.html',
  styleUrls: ['unit-properties.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatOption,
    NewGroupButtonComponent,
    CdkTextareaAutosize,
    SelectModuleComponent,
    MatButton,
    ProfileFormComponent,
    ItemsComponent,
    DatePipe,
    TranslateModule,
    MatIcon,
    CanReturnUnitPipe,
    MatProgressSpinner
  ]
})
export class UnitPropertiesComponent
  extends RequestMessageDirective
  implements OnDestroy {
  @ViewChild('editor') editorSelector: SelectModuleComponent | undefined;
  @ViewChild('player') playerSelector: SelectModuleComponent | undefined;
  @ViewChild('schemer') schemerSelector: SelectModuleComponent | undefined;
  private unitIdChangedSubscription: Subscription | undefined;
  private unitFormDataChangedSubscription: Subscription | undefined;
  private editorSelectionChangedSubscription: Subscription | undefined;
  private playerSelectionChangedSubscription: Subscription | undefined;
  private schemerSelectionChangedSubscription: Subscription | undefined;
  private statesChangedSubscription: Subscription | undefined;
  ngUnsubscribe = new Subject<void>();
  metadata!: UnitMetadataValues;
  get iqbMetadataValues(): IqbUnitMetadataValues {
    return this.metadata as unknown as IqbUnitMetadataValues;
  }

  workspaceSettings!: WorkspaceSettingsDto;
  metadataLoader: BehaviorSubject<UnitMetadataValues> = new BehaviorSubject({});
  variablesLoader: BehaviorSubject<AliasId[]> = new BehaviorSubject<AliasId[]>(
    []
  );

  unitForm: UntypedFormGroup;
  form = new FormGroup({});
  selectedStateId: string | null = null;
  selectedStateColor = '';
  selectedUnitId = 0;
  initialTranscript = '';
  initialReference = '';
  unitProfile!: MDProfile;
  itemProfile!: MDProfile;
  variablesLoaded: boolean = false;
  metadataLoaded: boolean = false;
  private readonly propertiesNotLoadedState = signal(false);
  readonly propertiesNotLoaded = this.propertiesNotLoadedState.asReadonly();

  constructor(
    private fb: UntypedFormBuilder,
    public workspaceService: WorkspaceService,
    public unitStores: UnitStoresService,
    public moduleService: ModuleService,
    public backendService: WorkspaceBackendService,
    public router: Router,
    public route: ActivatedRoute,
    public snackBar: MatSnackBar,
    public selectUnitDialog: MatDialog,
    public uploadReportDialog: MatDialog,
    private confirmDialog: MatDialog,
    public translateService: TranslateService,
    private metadataBackendService: MetadataBackendService,
    public metadataService: MetadataService,
    public i18nService: I18nService
  ) {
    super();
    this.unitForm = this.fb.group({
      key: this.fb.control(''),
      name: this.fb.control(''),
      description: this.fb.control(''),
      state: this.fb.control(''),
      group: this.fb.control(''),
      transcript: this.fb.control(''),
      reference: this.fb.control('')
    });
    this.metadataLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(metadata => {
        this.metadata = metadata;
        this.metadataLoaded = true;
      });
    this.variablesLoader.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.variablesLoaded = true;
    });
    this.addSubscriptionForUnitDefinitionChanges();
    // after a save that created items, so that the items editor holds their uuids
    this.workspaceService.unitMetadataReloaded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.loadMetaData());
    this.unitIdChangedSubscription =
      this.workspaceService.selectedUnit$.subscribe(id => {
        this.readDataForUnitId(id);
      });
  }

  private readDataForUnitId(unitId: number): void {
    this.selectedUnitId = unitId;
    this.variablesLoaded = false;
    this.metadataLoaded = false;
    this.propertiesNotLoadedState.set(false);
    this.readData();
  }

  // properties
  private async readData() {
    if (Object.keys(this.moduleService.editors).length === 0) await this.moduleService.loadList();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.editorSelectionChangedSubscription) this.editorSelectionChangedSubscription.unsubscribe();
    if (this.playerSelectionChangedSubscription) this.playerSelectionChangedSubscription.unsubscribe();
    if (this.schemerSelectionChangedSubscription) this.schemerSelectionChangedSubscription.unsubscribe();
    if (this.statesChangedSubscription) this.statesChangedSubscription.unsubscribe();
    this.workspaceService
      .loadUnitProperties()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.setupForm();
        // nothing more is asked for a unit whose properties the server did not answer for
        if (this.propertiesNotLoaded()) return;
        this.updateVariables();
        this.loadMetaData();
      });
  }

  private setupForm() {
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    const unitMetadataStore = this.unitStores.metadataStore();
    // the store of a unit the server did not answer for holds its id alone, and filling the form
    // with it failed, so that the form went on showing the unit before (#2004)
    this.propertiesNotLoadedState.set(selectedUnitId > 0 && !!unitMetadataStore && !unitMetadataStore.loaded);
    if (selectedUnitId > 0 && unitMetadataStore?.loaded) {
      const unitMetadata = unitMetadataStore.getData();
      this.selectedStateId = unitMetadata.state || null;
      const keyControl = this.unitForm.get('key');
      if (keyControl) {
        keyControl.markAsUntouched();
        keyControl.setValidators([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(WorkspaceService.unitKeyPatternString()),
          WorkspaceService.unitKeyUniquenessValidator(
            unitMetadata.id,
            () => this.workspaceService.unitList
          )
        ]);
      }
      this.unitForm.setValue(
        {
          key: unitMetadata.key,
          name: unitMetadata.name,
          state: unitMetadata.state,
          description: unitMetadata.description,
          reference: unitMetadata.reference,
          transcript: unitMetadata.transcript,
          group: unitMetadata.groupName
        },
        { emitEvent: false }
      );

      if (keyControl) {
        keyControl.updateValueAndValidity({ emitEvent: false });
        if (keyControl.invalid) {
          keyControl.markAsTouched();
        }

        this.workspaceService.isValidFormKey.next(
          keyControl.status === 'VALID'
        );
        this.reportUnitKeyTaken();
      }

      this.selectedStateColor = unitMetadata.state || '';
      this.unitFormDataChangedSubscription = this.unitForm.valueChanges.subscribe(() => {
        const filteredState = this.workspaceService.states
          ?.filter((state:State) => state.id.toString() === this.unitForm.get('state')?.value) || 0;
        filteredState.length ? this.selectedStateColor = filteredState[0].color : this.selectedStateColor = '';
        const isValidFormKey = this.unitForm.get('key')?.status === 'VALID';
        this.workspaceService.isValidFormKey.next(isValidFormKey);
        this.unitStores.metadataStore()?.setBasicData(
          this.unitForm.get('key')?.value,
          this.unitForm.get('name')?.value,
          this.unitForm.get('description')?.value,
          this.unitForm.get('group')?.value,
          this.unitForm.get('transcript')?.value,
          this.unitForm.get('reference')?.value,
          this.unitForm.get('state')?.value
        );
        this.reportUnitKeyTaken();
      });
      this.unitForm.enable();
      // timeout because we access ViewChildren
      setTimeout(() => this.initVeronaModules(unitMetadata));
      setTimeout(() => {
        const filteredStates = this.workspaceService.states?.filter(
          (state: State) => state.id.toString() === unitMetadata.state
        );
        filteredStates?.length ?
          (this.selectedStateColor = filteredStates[0].color) :
          (this.selectedStateColor = '');
      }, 1);
    } else {
      // bound to the state select beside the form, it would put back the state of the unit before
      this.selectedStateId = null;
      this.selectedStateColor = '';
      this.unitForm.setValue(
        {
          key: '',
          name: '',
          description: '',
          group: '',
          reference: '',
          transcript: '',
          state: ''
        },
        { emitEvent: false }
      );
      this.unitForm.disable();
    }
    this.initialTranscript = this.unitForm.get('transcript')?.value;
    this.initialReference = this.unitForm.get('reference')?.value;
  }

  /**
   * A taken key blocks saving only once it is a change: a unit that already carries a key another
   * unit has -- from before the server checked renames -- stays editable, as the server only checks a
   * key that is changed (#1842).
   */
  private reportUnitKeyTaken(): void {
    const keyChanged = this.unitStores.metadataStore()?.getChangedData().key !== undefined;
    this.workspaceService.setUnitKeyTaken(keyChanged && !!this.unitForm.get('key')?.hasError('keyNotUnique'));
  }

  private initVeronaModules(unitMetadata: UnitPropertiesDto): void {
    if (this.editorSelector) {
      this.editorSelector.value = unitMetadata.editor || '';
      this.editorSelectionChangedSubscription =
        this.editorSelector.selectionChanged.subscribe(selectedValue => {
          this.unitStores
            .metadataStore()
            ?.setEditor(selectedValue);
        });
    }
    if (this.playerSelector) {
      this.playerSelector.value = unitMetadata.player || '';
      this.playerSelectionChangedSubscription =
        this.playerSelector.selectionChanged.subscribe(selectedValue => {
          this.unitStores
            .metadataStore()
            ?.setPlayer(selectedValue);
        });
    }
    if (this.schemerSelector) {
      this.schemerSelector.value = unitMetadata.schemer || '';
      this.schemerSelectionChangedSubscription =
        this.schemerSelector.selectionChanged.subscribe(selectedValue => {
          this.unitStores
            .metadataStore()
            ?.setSchemer(selectedValue);
        });
    }
  }

  private loadMetaData() {
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    const unitMetadataStore = this.unitStores.metadataStore();
    if (selectedUnitId > 0 && unitMetadataStore?.loaded) {
      this.workspaceSettings = this.workspaceService.workspaceSettings;
      const unitMetadata = unitMetadataStore.getData();
      this.metadataLoader.next(
        JSON.parse(JSON.stringify(unitMetadata.metadata))
      );
      this.getProfiles();
    }
  }

  private getProfiles(): void {
    if (
      this.workspaceSettings &&
      this.workspaceSettings.unitMDProfile &&
      !this.unitProfile
    ) {
      this.metadataBackendService
        .getMetadataProfile(this.workspaceSettings.unitMDProfile)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(profile => {
          const unitProfile = profile as unknown as MDProfile;
          this.metadataService.loadProfileVocabularies(unitProfile).then(() => {
            this.unitProfile = unitProfile;
          });
        });
    }

    if (
      this.workspaceSettings &&
      this.workspaceSettings.itemMDProfile &&
      !this.itemProfile
    ) {
      this.metadataBackendService
        .getMetadataProfile(this.workspaceSettings.itemMDProfile)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(profile => {
          const itemProfile = profile as unknown as MDProfile;
          this.metadataService.loadProfileVocabularies(itemProfile).then(() => {
            this.itemProfile = itemProfile;
          });
        });
    }
  }

  private updateVariables(): void {
    this.unitStores
      .loadSchemeStore(this.workspaceService.selectedWorkspaceId, this.workspaceService.selectedUnit$.getValue())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(unitSchemeStore => {
        // handed on only once the scheme is there: without it the list is empty, and an item would
        // take the empty list for its variable having gone
        if (unitSchemeStore) this.variablesLoader.next(this.unitStores.variables());
      });
  }

  // follows whichever definition store there is, the editor may open one only after this view
  private addSubscriptionForUnitDefinitionChanges(): void {
    this.unitStores.definitionStore$
      .pipe(
        switchMap(store => store?.dataChange ?? EMPTY),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => this.variablesLoader.next(this.unitStores.variables()));
  }

  /**
   * Profiles and items are edited by two independent child components. Each change must update only
   * its own slice of the stored metadata: merging into the store's current value (rather than
   * replacing it, or rebuilding `this.metadata` which would retrigger the items editor and drop
   * in-flight item edits) keeps both the unit profiles and the item metadata when either side
   * changes.
   */
  onMetadataChange(metadata: Partial<IqbUnitMetadataValues>): void {
    const store = this.unitStores.metadataStore();
    if (!store) return;
    const current = (store.getData().metadata ?? {}) as UnitMetadataValues;
    // Only overwrite the profiles slice when the event actually carries one, so a
    // profiles-less emit can never clobber the stored profiles (an empty array is
    // a deliberate "clear", undefined is not).
    store.setMetadata({
      ...current,
      ...(metadata.profiles && { profiles: metadata.profiles as unknown as UnitMetadataValues['profiles'] })
    });
  }

  onItemsMetadataChange(metadata: UnitMetadataValues): void {
    const store = this.unitStores.metadataStore();
    if (!store) return;
    const current = (store.getData().metadata ?? {}) as UnitMetadataValues;
    store.setMetadata({
      ...current,
      ...(metadata.items && { items: metadata.items })
    });
  }

  onGroupNameChange(name: string): void {
    this.unitForm.get('group')?.setValue(name);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.unitIdChangedSubscription) this.unitIdChangedSubscription.unsubscribe();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.editorSelectionChangedSubscription) this.editorSelectionChangedSubscription.unsubscribe();
    if (this.playerSelectionChangedSubscription) this.playerSelectionChangedSubscription.unsubscribe();
    if (this.schemerSelectionChangedSubscription) this.schemerSelectionChangedSubscription.unsubscribe();
    if (this.statesChangedSubscription) this.statesChangedSubscription.unsubscribe();
  }

  deleteDeprecatedProperty(property: 'transcript' | 'reference'): void {
    const propertyControl = this.unitForm.get(property);
    if (propertyControl) {
      propertyControl.setValue('');
    }
  }

  async submitUnit(): Promise<void> {
    this.confirmDialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: this.translateService.instant('workspace.submit-unit'),
          content: this.translateService.instant(
            'workspace.submit-unit-confirm'
          ),
          confirmButtonLabel: this.translateService.instant(
            'workspace.submit-units'
          ),
          showCancel: true
        }
      })
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async confirmed => {
        if (!confirmed) return;
        const routingOk = await this.selectUnit(0);
        if (routingOk) {
          this.backendService
            .submitUnits(
              this.workspaceService.selectedWorkspaceId,
              this.workspaceService.dropBoxId!,
              [this.selectedUnitId]
            )
            .subscribe(uploadStatus => {
              this.showRequestMessage(
                uploadStatus,
                'workspace.unit-not-submitted',
                'workspace.unit-submitted'
              );
            });
        }
      });
  }

  async returnSubmittedUnit(): Promise<void> {
    this.confirmDialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: this.translateService.instant(
            'workspace.return-submitted-unit'
          ),
          content: this.translateService.instant(
            'workspace.return-submitted-unit-confirm'
          ),
          confirmButtonLabel: this.translateService.instant(
            'workspace.return-submitted-unit'
          ),
          showCancel: true
        }
      })
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async confirmed => {
        if (!confirmed) return;
        const routingOk = await this.selectUnit(0);
        if (routingOk) {
          this.backendService
            .returnSubmittedUnits(this.workspaceService.selectedWorkspaceId, [
              this.selectedUnitId
            ])
            .subscribe(uploadStatus => {
              this.showRequestMessage(
                uploadStatus,
                'workspace.unit-not-returned',
                'workspace.unit-returned'
              );
            });
        }
      });
  }
}

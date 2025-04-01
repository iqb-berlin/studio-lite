import {
  Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import {
  FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import {
  BehaviorSubject, firstValueFrom, Subject, Subscription, takeUntil
} from 'rxjs';
import { UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import {
  MatCard, MatCardHeader, MatCardTitle, MatCardContent
} from '@angular/material/card';
import { CodingScheme } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { NewGroupButtonComponent } from '../new-group-button/new-group-button.component';
import { ProfileFormComponent } from '../../../metadata/components/profile-form/profile-form.component';
import { ItemsComponent } from '../../../metadata/components/items/items.component';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';
import { State } from '../../../admin/models/state.type';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { SelectModuleComponent } from '../../../shared/components/select-module/select-module.component';
import { WorkspaceService } from '../../services/workspace.service';
import { ModuleService } from '../../../shared/services/module.service';
import { RequestMessageDirective } from '../../directives/request-message.directive';
import { CanReturnUnitPipe } from '../../pipes/can-return-unit.pipe';
import { AliasId } from '../../../metadata/models/alias-id.interface';
import { WorkspaceSettings } from '../../../wsg-admin/models/workspace-settings.interface';

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
    CanReturnUnitPipe
  ]
})
export class UnitPropertiesComponent
  extends RequestMessageDirective
  implements OnInit, OnDestroy {
  @ViewChild('editor') editorSelector: SelectModuleComponent | undefined;
  @ViewChild('player') playerSelector: SelectModuleComponent | undefined;
  @ViewChild('schemer') schemerSelector: SelectModuleComponent | undefined;
  private readonly unitIdChangedSubscription: Subscription | undefined;
  private unitFormDataChangedSubscription: Subscription | undefined;
  private editorSelectionChangedSubscription: Subscription | undefined;
  private playerSelectionChangedSubscription: Subscription | undefined;
  private schemerSelectionChangedSubscription: Subscription | undefined;
  private metadataSubscription: Subscription | undefined;
  private statesChangedSubscription: Subscription | undefined;
  private ngUnsubscribe = new Subject<void>();
  metadata!: UnitMetadataValues;
  workspaceSettings!: WorkspaceSettings | null;
  metadataLoader: BehaviorSubject<UnitMetadataValues> = new BehaviorSubject({});
  variablesLoader: BehaviorSubject<AliasId[]> = new BehaviorSubject<AliasId[]>([]);
  unitForm: UntypedFormGroup;
  timeZone = 'Europe/Berlin';
  form = new FormGroup({});
  selectedStateId = '0';
  selectedStateColor = '';
  selectedUnitId = 0;
  initialTranscript = '';
  initialReference = '';

  constructor(
    private fb: UntypedFormBuilder,
    public workspaceService: WorkspaceService,
    public moduleService: ModuleService,
    public backendService: WorkspaceBackendService,
    public router: Router,
    public route: ActivatedRoute,
    public snackBar: MatSnackBar,
    public selectUnitDialog: MatDialog,
    public uploadReportDialog: MatDialog,
    public translateService: TranslateService
  ) {
    super();
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.unitForm = this.fb.group({
      key: this.fb.control(''),
      name: this.fb.control(''),
      description: this.fb.control(''),
      state: this.fb.control('0'),
      group: this.fb.control(''),
      transcript: this.fb.control(''),
      reference: this.fb.control('')
    });
    this.metadataLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(metadata => { this.metadata = metadata; });
    this.addSubscriptionForUnitDefinitionChanges();
    this.unitIdChangedSubscription =
      this.workspaceService.selectedUnit$.subscribe(id => this.readDataForUnitId(id)
      );
    this.updateVariables();
  }

  async ngOnInit(): Promise<void> {
    // load studio with selected unit
    if (this.workspaceService.selectedUnit$.getValue()) {
      await this.readDataForUnitId(
        this.workspaceService.selectedUnit$.getValue()
      );
    }
    await this.updateVariables();
  }

  private async readDataForUnitId(unitId: number): Promise<void> {
    this.selectedUnitId = unitId;
    await this.readData();
  }

  // properties
  private async readData() {
    try {
      // Ensure that editors are loaded before proceeding.
      if (Object.keys(this.moduleService.editors).length === 0) {
        await this.moduleService.loadList();
      }

      await this.workspaceService.loadUnitProperties();
      this.setupForm();
      await this.updateVariables();
      await this.loadMetaData();
    } catch (error) {
      console.error('Error fetching data', error);
    }
  }

  private setupForm() {
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    const unitMetadataStore = this.workspaceService.getUnitMetadataStore();
    if (selectedUnitId > 0 && unitMetadataStore) {
      const unitMetadata = unitMetadataStore.getData();
      this.selectedStateId = unitMetadata.state || '0';
      // eslint-disable-next-line @typescript-eslint/dot-notation
      this.unitForm.controls['key'].setValidators([Validators.required, Validators.pattern('[a-zA-Z-0-9_]+'),
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('[a-zA-Z-0-9_]+'),
        WorkspaceService.unitKeyUniquenessValidator(unitMetadata.id, this.workspaceService.unitList)]);
      this.unitForm.setValue({
        key: unitMetadata.key,
        name: unitMetadata.name,
        state: unitMetadata.state,
        description: unitMetadata.description,
        reference: unitMetadata.reference,
        transcript: unitMetadata.transcript,
        group: unitMetadata.groupName
      }, { emitEvent: false });
      if (this.editorSelector) {
        this.editorSelector.value = unitMetadata.editor || '';
        this.editorSelectionChangedSubscription =
          this.editorSelector.selectionChanged.subscribe(selectedValue => {
            this.workspaceService
              .getUnitMetadataStore()
              ?.setEditor(selectedValue);
          });
      }
      if (this.playerSelector) {
        this.playerSelector.value = unitMetadata.player || '';
        this.playerSelectionChangedSubscription = this.playerSelector.selectionChanged.subscribe(selectedValue => {
          this.workspaceService.getUnitMetadataStore()?.setPlayer(selectedValue);
        });
      }
      if (this.schemerSelector) {
        this.schemerSelector.value = unitMetadata.schemer || '';
        this.schemerSelectionChangedSubscription = this.schemerSelector.selectionChanged.subscribe(selectedValue => {
          this.workspaceService.getUnitMetadataStore()?.setSchemer(selectedValue);
        });
      }
      this.selectedStateColor = unitMetadata.state || '0';
      this.unitFormDataChangedSubscription = this.unitForm.valueChanges.subscribe(() => {
        const filteredState = this.workspaceService.states
          ?.filter((state:State) => state.id.toString() === this.unitForm.get('state')?.value) || 0;
        filteredState.length ? this.selectedStateColor = filteredState[0].color : this.selectedStateColor = '';
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const isValidFormKey = this.unitForm.controls?.['key'].status === 'VALID';
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.workspaceService.isValidFormKey.next(isValidFormKey);
        this.workspaceService.getUnitMetadataStore()?.setBasicData(
          this.unitForm.get('key')?.value,
          this.unitForm.get('name')?.value,
          this.unitForm.get('description')?.value,
          this.unitForm.get('group')?.value,
          this.unitForm.get('transcript')?.value,
          this.unitForm.get('reference')?.value,
          this.unitForm.get('state')?.value
        );
      });
      this.unitForm.enable();
      setTimeout(() => {
        const filteredStates = this.workspaceService.states
          ?.filter((state:State) => state.id.toString() === unitMetadata.state);
        filteredStates?.length ? this.selectedStateColor = filteredStates[0].color : this.selectedStateColor = '';
      }, 1);
    } else {
      this.unitForm.setValue({
        key: '',
        name: '',
        description: '',
        group: '',
        reference: '',
        transcript: '',
        state: ''
      }, { emitEvent: false });
      this.unitForm.disable();
    }
    this.initialTranscript = this.unitForm.get('transcript')?.value;
    this.initialReference = this.unitForm.get('reference')?.value;
  }

  // metadata

  private async loadMetaData(): Promise<void> {
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    const unitMetadataStore = this.workspaceService.getUnitMetadataStore();
    if (selectedUnitId > 0 && unitMetadataStore) {
      this.workspaceSettings = await firstValueFrom(
        this.workspaceService.workspaceSettings$
      );
      const unitMetadata = unitMetadataStore.getData();
      const metadata = JSON.parse(JSON.stringify(unitMetadata.metadata)) || {};
      this.metadataLoader.next({ ...metadata });
    } else {
      this.metadataLoader.next({});
    }
  }

  private async updateVariables(): Promise<void> {
    const unitId = this.workspaceService.selectedUnit$.getValue();
    if (!this.workspaceService.getUnitSchemeStore()) {
      try {
        const unitScheme = await firstValueFrom(
          this.backendService.getUnitScheme(
            this.workspaceService.selectedWorkspaceId,
            unitId
          )
        );
        if (unitScheme) {
          this.workspaceService.setUnitSchemeStore(
            new UnitSchemeStore(unitId, unitScheme)
          );
          this.variablesLoader.next(this.getItems());
        }
      } catch (error) {
        console.error('Error fetching UnitScheme:', error);
      }
    } else {
      this.variablesLoader.next(this.getItems());
    }
  }

  private addSubscriptionForUnitDefinitionChanges(): void {
    if (this.workspaceService.getUnitDefinitionStore()) {
      this.subscribeUnitDefinitionChanges();
    } else {
      this.workspaceService.unitDefinitionStoreChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.subscribeUnitDefinitionChanges();
        });
    }
  }

  private subscribeUnitDefinitionChanges() {
    this.workspaceService.getUnitDefinitionStore()?.dataChange
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.variablesLoader.next(this.getItems());
      });
  }

  private getItems(): AliasId[] {
    const data = this.workspaceService.getUnitSchemeStore()?.getData();
    if (data) {
      const unitSchemeVariables = data.variables || [];
      const defStoreVariables: VariableInfo[] = this.workspaceService
        .getUnitDefinitionStore()?.getData().variables || unitSchemeVariables;
      if (defStoreVariables) {
        const variables = defStoreVariables.filter(v => v.type !== 'no-value');
        const variableAliasIds = variables.map(variable => ({ id: variable.id, alias: variable.alias || variable.id }));
        const scheme: CodingScheme = JSON.parse(data.scheme);
        const variableCodings = scheme?.variableCodings || [];
        const variableCodingIds = variableCodings
          .filter(vc => vc.sourceType !== 'BASE_NO_VALUE')
          .map(item => ({ id: item.id, alias: item.alias || item.id }));
        // merge without duplicates
        return [...variableAliasIds, ...variableCodingIds]
          .reduce((acc: AliasId[], current: AliasId) => {
            if (!acc.find(aliasId => aliasId.id === current.id && aliasId.alias === current.alias)) {
              acc.push(current);
            }
            return acc;
          }, []);
      }
    }
    return [];
  }

  onMetadataChange(metadata: UnitMetadataValues): void {
    this.workspaceService.getUnitMetadataStore()?.setMetadata(metadata);
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
    if (this.metadataSubscription) {
      this.metadataSubscription.unsubscribe();
    }
  }

  deleteDeprecatedProperty(property: 'transcript' | 'reference'): void {
    const propertyControl = this.unitForm.get(property);
    if (propertyControl) {
      propertyControl.setValue('');
    }
  }

  async submitUnit(): Promise<void> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      this.backendService.submitUnits(
        this.workspaceService.selectedWorkspaceId,
        this.workspaceService.dropBoxId!,
        [this.selectedUnitId]
      )
        .subscribe(
          uploadStatus => {
            this.showRequestMessage(uploadStatus, 'workspace.unit-not-submitted', 'workspace.unit-submitted');
          });
    }
  }

  async returnSubmittedUnit(): Promise<void> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      this.backendService.returnSubmittedUnits(
        this.workspaceService.selectedWorkspaceId,
        [this.selectedUnitId]
      )
        .subscribe(
          uploadStatus => {
            this.showRequestMessage(uploadStatus, 'workspace.unit-not-returned', 'workspace.unit-returned');
          });
    }
  }
}

import {
  Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import {
  FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import {
  BehaviorSubject, Subject, Subscription, takeUntil
} from 'rxjs';
import { UnitMetadataValues, WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
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
import { CodingScheme, VariableInfo } from '@iqb/responses';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { MatMenuItem } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { NewGroupButtonComponent } from '../new-group-button/new-group-button.component';
import { ProfileFormComponent } from '../../../metadata/components/profile-form/profile-form.component';
import { ItemsComponent } from '../../../metadata/components/items/items.component';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';
import { State } from '../../../admin/models/state.type';
import { BackendService } from '../../services/backend.service';
import { SelectModuleComponent } from '../../../shared/components/select-module/select-module.component';
import { WorkspaceService } from '../../services/workspace.service';
import { ModuleService } from '../../../shared/services/module.service';
import { RequestMessageDirective } from '../../directives/request-message.directive';
import { CanReturnUnitPipe } from '../../pipes/can-return-unit.pipe';

@Component({
  templateUrl: './unit-properties.component.html',
  styleUrls: ['unit-properties.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatCard, MatCardHeader, MatCardTitle, MatCardContent,
    MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatMenuItem, MatTooltip,
    MatFormField, MatLabel, MatInput, MatError, MatSelect, MatOption, NewGroupButtonComponent,
    CdkTextareaAutosize, SelectModuleComponent, MatButton, ProfileFormComponent, ItemsComponent, DatePipe,
    TranslateModule, MatIcon, CanReturnUnitPipe]
})

export class UnitPropertiesComponent extends RequestMessageDirective implements OnInit, OnDestroy {
  @ViewChild('editor') editorSelector: SelectModuleComponent | undefined;
  @ViewChild('player') playerSelector: SelectModuleComponent | undefined;
  @ViewChild('schemer') schemerSelector: SelectModuleComponent | undefined;
  private unitIdChangedSubscription: Subscription | undefined;
  private unitFormDataChangedSubscription: Subscription | undefined;
  private editorSelectionChangedSubscription: Subscription | undefined;
  private playerSelectionChangedSubscription: Subscription | undefined;
  private schemerSelectionChangedSubscription: Subscription | undefined;
  private statesChangedSubscription: Subscription | undefined;
  private ngUnsubscribe = new Subject<void>();
  metadata!: UnitMetadataValues;
  workspaceSettings!: WorkspaceSettingsDto;
  metadataLoader: BehaviorSubject<UnitMetadataValues> = new BehaviorSubject({});
  variablesLoader: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
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
    public backendService: BackendService,
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
  }

  async ngOnInit(): Promise<void> {
    this.unitIdChangedSubscription = this.workspaceService.selectedUnit$
      .subscribe(id => {
        this.selectedUnitId = id;
        this.readData();
      });
    this.initItemLoader();
    this.addSubscriptionForUnitDefinitionChanges();
    this.metadataLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(metadata => {
        this.metadata = metadata;
      });
  }

  // properties
  private async readData() {
    if (Object.keys(this.moduleService.editors).length === 0) await this.moduleService.loadList();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.editorSelectionChangedSubscription) this.editorSelectionChangedSubscription.unsubscribe();
    if (this.playerSelectionChangedSubscription) this.playerSelectionChangedSubscription.unsubscribe();
    if (this.schemerSelectionChangedSubscription) this.schemerSelectionChangedSubscription.unsubscribe();
    if (this.statesChangedSubscription) this.statesChangedSubscription.unsubscribe();
    this.workspaceService.loadUnitMetadata().then(() => {
      this.setupForm();
      this.initItemLoader();
      this.loadMetaData();
    });
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
        this.editorSelectionChangedSubscription = this.editorSelector.selectionChanged.subscribe(selectedValue => {
          this.workspaceService.getUnitMetadataStore()?.setEditor(selectedValue);
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

  private loadMetaData() {
    this.workspaceSettings = this.workspaceService.workspaceSettings;
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    const unitMetadataStore = this.workspaceService.getUnitMetadataStore();
    if (selectedUnitId > 0 && unitMetadataStore) {
      const unitMetadata = unitMetadataStore.getData();
      this.metadataLoader.next(JSON.parse(JSON.stringify(unitMetadata.metadata)));
    }
  }

  private initItemLoader(): void {
    const unitId = this.workspaceService.selectedUnit$.getValue();
    if (!this.workspaceService.getUnitSchemeStore()) {
      this.backendService.getUnitScheme(this.workspaceService.selectedWorkspaceId, unitId)
        .subscribe(ues => {
          if (ues) {
            this.workspaceService.setUnitSchemeStore(new UnitSchemeStore(unitId, ues));
            this.variablesLoader.next(this.getItems());
          }
        });
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

  private getItems(): string[] {
    const data = this.workspaceService.getUnitSchemeStore()?.getData();
    if (data) {
      const unitSchemeVariables = data.variables || [];
      const variables: VariableInfo[] = this.workspaceService
        .getUnitDefinitionStore()?.getData().variables || unitSchemeVariables;
      if (variables) {
        const variableIds = variables.map(variable => variable.id);
        const scheme: CodingScheme = JSON.parse(data.scheme);
        const variableCodings = scheme?.variableCodings || [];
        const variableCodingIds = variableCodings.map(item => item.id);
        // merge without duplicates
        return [...new Set([...variableIds, ...variableCodingIds])];
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
  }

  deleteDeprecatedProperty(property: 'transcript' | 'reference'): void {
    const propertyControl = this.unitForm.get(property);
    if (propertyControl) {
      propertyControl.setValue('');
    }
  }

  submitUnit(): void {
    this.backendService.submitUnits(
      this.workspaceService.selectedWorkspaceId,
      this.workspaceService.dropBoxId!,
      [this.selectedUnitId]
    ).subscribe(
      uploadStatus => {
        this.showRequestMessage(uploadStatus, 'workspace.unit-not-submitted', 'workspace.unit-submitted');
      });
  }

  returnSubmittedUnit(): void {
    this.backendService.returnSubmittedUnits(
      this.workspaceService.selectedWorkspaceId,
      [this.selectedUnitId]
    ).subscribe(
      uploadStatus => {
        this.showRequestMessage(uploadStatus, 'workspace.unit-not-returned', 'workspace.unit-returned');
      });
  }
}

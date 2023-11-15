import {
  Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import {
  FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModuleService } from '../../../shared/services/module.service';
import { WorkspaceService } from '../../services/workspace.service';
import { SelectModuleComponent } from '../../../shared/components/select-module/select-module.component';
import { BackendService } from '../../services/backend.service';
import { State } from '../../../admin/models/state.type';

@Component({
  templateUrl: './unit-properties.component.html',
  styleUrls: ['unit-properties.component.scss']
})

export class UnitPropertiesComponent implements OnInit, OnDestroy {
  @ViewChild('editor') editorSelector: SelectModuleComponent | undefined;
  @ViewChild('player') playerSelector: SelectModuleComponent | undefined;
  @ViewChild('schemer') schemerSelector: SelectModuleComponent | undefined;
  private unitIdChangedSubscription: Subscription | undefined;
  private unitFormDataChangedSubscription: Subscription | undefined;
  private editorSelectionChangedSubscription: Subscription | undefined;
  private playerSelectionChangedSubscription: Subscription | undefined;
  private schemerSelectionChangedSubscription: Subscription | undefined;
  private statesChangedSubscription: Subscription | undefined;
  unitForm: UntypedFormGroup;
  timeZone = 'Europe/Berlin';
  form = new FormGroup({});
  selectedStateId = '0';
  selectedStateColor = '';

  constructor(
    private fb: UntypedFormBuilder,
    public workspaceService: WorkspaceService,
    public moduleService: ModuleService,
    public backendService: BackendService
  ) {
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
      .subscribe(() => {
        this.readData();
      });
  }

  private async readData() {
    if (Object.keys(this.moduleService.editors).length === 0) await this.moduleService.loadList();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.editorSelectionChangedSubscription) this.editorSelectionChangedSubscription.unsubscribe();
    if (this.playerSelectionChangedSubscription) this.playerSelectionChangedSubscription.unsubscribe();
    if (this.schemerSelectionChangedSubscription) this.schemerSelectionChangedSubscription.unsubscribe();
    if (this.statesChangedSubscription) this.statesChangedSubscription.unsubscribe();
    this.workspaceService.loadUnitMetadata().then(() => this.setupForm());
  }

  private setupForm() {
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    if (selectedUnitId > 0 && this.workspaceService.unitMetadataStore) {
      const unitMetadata = this.workspaceService.unitMetadataStore.getData();
      this.selectedStateId = unitMetadata.state || '0';
      // eslint-disable-next-line @typescript-eslint/dot-notation
      this.unitForm.controls['key'].setValidators([Validators.required, Validators.pattern('[a-zA-Z-0-9_]+'),
        Validators.minLength(3),
        Validators.maxLength(19),
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
          this.workspaceService.unitMetadataStore?.setEditor(selectedValue);
        });
      }
      if (this.playerSelector) {
        this.playerSelector.value = unitMetadata.player || '';
        this.playerSelectionChangedSubscription = this.playerSelector.selectionChanged.subscribe(selectedValue => {
          this.workspaceService.unitMetadataStore?.setPlayer(selectedValue);
        });
      }
      if (this.schemerSelector) {
        this.schemerSelector.value = unitMetadata.schemer || '';
        this.schemerSelectionChangedSubscription = this.schemerSelector.selectionChanged.subscribe(selectedValue => {
          this.workspaceService.unitMetadataStore?.setSchemer(selectedValue);
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
        this.workspaceService.unitMetadataStore?.setBasicData(
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
        state: ''
      }, { emitEvent: false });
      this.unitForm.disable();
    }
  }

  ngOnDestroy(): void {
    if (this.unitIdChangedSubscription) this.unitIdChangedSubscription.unsubscribe();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.editorSelectionChangedSubscription) this.editorSelectionChangedSubscription.unsubscribe();
    if (this.playerSelectionChangedSubscription) this.playerSelectionChangedSubscription.unsubscribe();
    if (this.schemerSelectionChangedSubscription) this.schemerSelectionChangedSubscription.unsubscribe();
    if (this.statesChangedSubscription) this.statesChangedSubscription.unsubscribe();
  }
}

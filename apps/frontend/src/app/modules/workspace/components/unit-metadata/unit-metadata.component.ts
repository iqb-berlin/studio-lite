import {
  Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import {
  FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ModuleService } from '../../../shared/services/module.service';
import { WorkspaceService } from '../../services/workspace.service';
import { SelectModuleComponent } from '../../../shared/components/select-module/select-module.component';
import { NestedTreeComponent } from '../../../shared/components/nested-tree/nested-tree.component';

@Component({
  templateUrl: './unit-metadata.component.html',
  styleUrls: ['unit-metadata.component.scss']
})

export class UnitMetadataComponent implements OnInit, OnDestroy {
  @ViewChild('editor') editorSelector: SelectModuleComponent | undefined;
  @ViewChild('player') playerSelector: SelectModuleComponent | undefined;
  @ViewChild('schemer') schemerSelector: SelectModuleComponent | undefined;
  private unitIdChangedSubscription: Subscription | undefined;
  private unitFormDataChangedSubscription: Subscription | undefined;
  private editorSelectionChangedSubscription: Subscription | undefined;
  private playerSelectionChangedSubscription: Subscription | undefined;
  private schemerSelectionChangedSubscription: Subscription | undefined;
  unitForm: UntypedFormGroup;
  timeZone = 'Europe/Berlin';
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'text',
      type: 'input',
      props: {
        label: 'Text',
        placeholder: 'Type here to see the other field become enabled...'
      }
    },
    {
      key: 'text2',
      type: 'input',
      props: {
        label: 'Hey!',
        placeholder: 'This one is disabled if there is no text in the other input'
      },
      expressions: {
        'props.disabled': '!model.text'
      }
    }
  ];

  constructor(
    private fb: UntypedFormBuilder,
    public workspaceService: WorkspaceService,
    public moduleService: ModuleService,
    private educationalStandardDialog : MatDialog
  ) {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.unitForm = this.fb.group({
      key: this.fb.control(''),
      name: this.fb.control(''),
      description: this.fb.control(''),
      group: this.fb.control(''),
      transcript: this.fb.control(''),
      reference: this.fb.control('')
    });
  }

  ngOnInit(): void {
    this.unitIdChangedSubscription = this.workspaceService.selectedUnit$
      .subscribe(() => {
        this.readData();
      });
  }

  showEducationalStandard() {
    const dialogRef = this.educationalStandardDialog.open(NestedTreeComponent, {
      width: '80%', height: '80%'
    });

    dialogRef.afterClosed().subscribe((vale: any) => { console.log(vale); });
  }

  private async readData() {
    if (Object.keys(this.moduleService.editors).length === 0) await this.moduleService.loadList();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.editorSelectionChangedSubscription) this.editorSelectionChangedSubscription.unsubscribe();
    if (this.playerSelectionChangedSubscription) this.playerSelectionChangedSubscription.unsubscribe();
    if (this.schemerSelectionChangedSubscription) this.schemerSelectionChangedSubscription.unsubscribe();
    this.workspaceService.loadUnitMetadata().then(() => this.setupForm());
  }

  private setupForm() {
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    if (selectedUnitId > 0 && this.workspaceService.unitMetadataStore) {
      const unitMetadata = this.workspaceService.unitMetadataStore.getData();
      // eslint-disable-next-line @typescript-eslint/dot-notation
      this.unitForm.controls['key'].setValidators([Validators.required, Validators.pattern('[a-zA-Z-0-9_]+'),
        Validators.minLength(3),
        Validators.maxLength(19),
        Validators.pattern('[a-zA-Z-0-9_]+'),
        WorkspaceService.unitKeyUniquenessValidator(unitMetadata.id, this.workspaceService.unitList)]);
      this.unitForm.setValue({
        key: unitMetadata.key,
        name: unitMetadata.name,
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
      this.unitFormDataChangedSubscription = this.unitForm.valueChanges.subscribe(() => {
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
          this.unitForm.get('reference')?.value
        );
      });
      this.unitForm.enable();
    } else {
      this.unitForm.setValue({
        key: '',
        name: '',
        description: '',
        group: ''
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
  }
}

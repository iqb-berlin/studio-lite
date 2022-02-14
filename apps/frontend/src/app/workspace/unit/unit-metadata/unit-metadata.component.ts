import {
  Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WorkspaceService } from '../../workspace.service';
import { BackendService } from '../../backend.service';
import { SelectModuleComponent } from './select-module.component';
import { UnitMetadataStore } from '../../workspace.classes';

@Component({
  templateUrl: './unit-metadata.component.html',
  styles: ['.mat-tab-body-wrapper {height: 100%;}',
    'mat-tab-body {height: 100%;}']
})

export class UnitMetadataComponent implements OnInit, OnDestroy {
  @ViewChild('editor') editorSelector: SelectModuleComponent | undefined;
  @ViewChild('player') playerSelector: SelectModuleComponent | undefined;
  private unitIdChangedSubscription: Subscription | undefined;
  private unitFormDataChangedSubscription: Subscription | undefined;
  private editorSelectionChangedSubscription: Subscription | undefined;
  private playerSelectionChangedSubscription: Subscription | undefined;
  unitForm: FormGroup;
  timeZone = 'Europe/Berlin';

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    public workspaceService: WorkspaceService
  ) {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.unitForm = this.fb.group({
      key: this.fb.control(''),
      name: this.fb.control(''),
      description: this.fb.control('')
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.unitIdChangedSubscription = this.workspaceService.selectedUnit$.subscribe(() => {
        this.readData();
      });
    });
  }

  private readData(): void {
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.editorSelectionChangedSubscription) this.editorSelectionChangedSubscription.unsubscribe();
    if (this.playerSelectionChangedSubscription) this.playerSelectionChangedSubscription.unsubscribe();
    if (this.workspaceService.unitMetadataStore) {
      this.setupForm();
    } else {
      this.backendService.getUnitMetadata(this.workspaceService.selectedWorkspace,
        this.workspaceService.selectedUnit$.getValue()).subscribe(unitData => {
        this.workspaceService.unitMetadataStore = new UnitMetadataStore(unitData);
        this.setupForm();
      });
    }
  }

  private setupForm() {
    if (this.workspaceService.unitMetadataStore) {
      const unitMetadata = this.workspaceService.unitMetadataStore.getData();
      this.unitForm.controls['key'].setValidators([Validators.required, Validators.pattern('[a-zA-Z-0-9_]+'),
        Validators.minLength(3),
        WorkspaceService.unitKeyUniquenessValidator(unitMetadata.id, this.workspaceService.unitList.units())]);
      this.unitForm.setValue({
        key: unitMetadata.key,
        name: unitMetadata.name,
        description: unitMetadata.description
      }, { emitEvent: false });
      if (this.editorSelector) {
        this.editorSelector.setModule(unitMetadata.editor ? unitMetadata.editor : '');
        this.editorSelectionChangedSubscription = this.editorSelector.selectionChanged.subscribe(selectedValue => {
          this.workspaceService.unitMetadataStore?.setEditor(selectedValue);
        });
      }
      if (this.playerSelector) {
        this.playerSelector.setModule(unitMetadata.player ? unitMetadata.player : '');
        this.playerSelectionChangedSubscription = this.playerSelector.selectionChanged.subscribe(selectedValue => {
          this.workspaceService.unitMetadataStore?.setPlayer(selectedValue);
        });
      }
      this.unitFormDataChangedSubscription = this.unitForm.valueChanges.subscribe(() => {
        this.workspaceService.unitMetadataStore?.setBasicData(
          this.unitForm.get('key')?.value,
          this.unitForm.get('name')?.value,
          this.unitForm.get('description')?.value
        );
      });
    }
  }

  ngOnDestroy(): void {
    if (this.unitIdChangedSubscription) this.unitIdChangedSubscription.unsubscribe();
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.editorSelectionChangedSubscription) this.editorSelectionChangedSubscription.unsubscribe();
    if (this.playerSelectionChangedSubscription) this.playerSelectionChangedSubscription.unsubscribe();
  }
}

import {
  Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkspaceService } from '../../workspace.service';
import { BackendService } from '../../backend.service';
import { BackendService as AppBackendService } from '../../../backend.service';
import { SelectModuleComponent } from './select-module.component';
import { UnitMetadataStore } from '../../workspace.classes';
import { InputTextComponent } from '../../../components/input-text.component';
import { AppService } from '../../../app.service';

@Component({
  templateUrl: './unit-metadata.component.html',
  styles: ['.mat-tab-body-wrapper {height: 100%;}',
    'mat-tab-body {height: 100%;}']
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

  constructor(
    private fb: UntypedFormBuilder,
    private backendService: BackendService,
    private appBackendService: AppBackendService,
    public workspaceService: WorkspaceService,
    public appService: AppService,
    private inputTextDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.unitForm = this.fb.group({
      key: this.fb.control(''),
      name: this.fb.control(''),
      description: this.fb.control(''),
      group: this.fb.control('')
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
    if (this.schemerSelectionChangedSubscription) this.schemerSelectionChangedSubscription.unsubscribe();
    if (this.workspaceService.unitMetadataStore) {
      this.setupForm();
    } else {
      const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
      this.backendService.getUnitMetadata(this.workspaceService.selectedWorkspaceId,
        selectedUnitId).subscribe(unitData => {
        this.workspaceService.unitMetadataStore = new UnitMetadataStore(
          unitData || <UnitMetadataDto>{ id: selectedUnitId }
        );
        this.setupForm();
      });
    }
  }

  private setupForm() {
    const selectedUnitId = this.workspaceService.selectedUnit$.getValue();
    if (selectedUnitId > 0 && this.workspaceService.unitMetadataStore) {
      const unitMetadata = this.workspaceService.unitMetadataStore.getData();
      this.unitForm.controls['key'].setValidators([Validators.required, Validators.pattern('[a-zA-Z-0-9_]+'),
        Validators.minLength(3),
        WorkspaceService.unitKeyUniquenessValidator(unitMetadata.id, this.workspaceService.unitList.units())]);
      this.unitForm.setValue({
        key: unitMetadata.key,
        name: unitMetadata.name,
        description: unitMetadata.description,
        group: unitMetadata.groupName
      }, { emitEvent: false });
      if (this.editorSelector) {
        this.editorSelector.setModule(unitMetadata.editor || '');
        this.editorSelectionChangedSubscription = this.editorSelector.selectionChanged.subscribe(selectedValue => {
          this.workspaceService.unitMetadataStore?.setEditor(selectedValue);
        });
      }
      if (this.playerSelector) {
        this.playerSelector.setModule(unitMetadata.player || '');
        this.playerSelectionChangedSubscription = this.playerSelector.selectionChanged.subscribe(selectedValue => {
          this.workspaceService.unitMetadataStore?.setPlayer(selectedValue);
        });
      }
      if (this.schemerSelector) {
        this.schemerSelector.setModule(unitMetadata.schemer || '');
        this.schemerSelectionChangedSubscription = this.schemerSelector.selectionChanged.subscribe(selectedValue => {
          this.workspaceService.unitMetadataStore?.setSchemer(selectedValue);
        });
      }
      this.unitFormDataChangedSubscription = this.unitForm.valueChanges.subscribe(() => {
        this.workspaceService.unitMetadataStore?.setBasicData(
          this.unitForm.get('key')?.value,
          this.unitForm.get('name')?.value,
          this.unitForm.get('description')?.value,
          this.unitForm.get('group')?.value
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

  newGroup() {
    const dialogRef = this.inputTextDialog.open(InputTextComponent, {
      width: '500px',
      data: {
        title: 'Neue Gruppe',
        default: '',
        okButtonLabel: 'Speichern',
        prompt: 'Namen der Gruppe'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result === 'string') {
        if (!this.workspaceService.workspaceSettings.unitGroups) {
          this.workspaceService.workspaceSettings.unitGroups = [];
        }
        if (this.workspaceService.workspaceSettings.unitGroups.indexOf(result) < 0) {
          this.workspaceService.workspaceSettings.unitGroups.push(result);
          this.appBackendService.setWorkspaceSettings(
            this.workspaceService.selectedWorkspaceId, this.workspaceService.workspaceSettings
          ).subscribe(isOK => {
            if (!isOK) {
              this.snackBar.open('Neue Gruppe konnte nicht gespeichert werden.', '', { duration: 3000 });
            } else {
              this.snackBar.open('Neue Gruppe gespeichert', '', { duration: 1000 });
              const groupControl = this.unitForm.get('group');
              if (groupControl) groupControl.setValue(result);
            }
          });
        }
      }
    });
  }
}

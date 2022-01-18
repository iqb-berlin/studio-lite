import {
  Component, Input, OnChanges, OnDestroy, OnInit, EventEmitter, Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DatastoreService } from '../../datastore.service';
import { UnitMetadata } from '../../backend.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-unit-metadata',
  templateUrl: './unit-metadata.component.html',
  styles: ['.mat-tab-body-wrapper {height: 100%;}',
    'mat-tab-body {height: 100%;}']
})

export class UnitMetadataComponent implements OnInit, OnDestroy, OnChanges {
  @Input() unitData!: UnitMetadata | null;
  @Output() unitDataChanged = new EventEmitter();
  unitForm: FormGroup;
  timeZone = 'Europe/Berlin';
  private unitFormDataChangedSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    public ds: DatastoreService
  ) {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.unitForm = this.fb.group({
      key: this.fb.control(''),
      label: this.fb.control(''),
      description: this.fb.control('')
    });
  }

  ngOnInit(): void {
    this.readData();
  }

  private readData(): void {
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
    if (this.unitData) {
      this.unitForm.controls['key'].setValidators([Validators.required, Validators.pattern('[a-zA-Z-0-9_]+'),
        Validators.minLength(3),
        DatastoreService.unitKeyUniquenessValidator(this.unitData.id, this.ds.unitList)]);
      this.unitForm.setValue({
        key: this.unitData.key,
        label: this.unitData.label,
        description: this.unitData.description
      }, { emitEvent: false });
      this.unitFormDataChangedSubscription = this.unitForm.valueChanges.subscribe(() => {
        if (this.unitData && this.unitForm.valid) {
          this.unitData.key = this.unitForm.get('key')?.value;
          this.unitData.label = this.unitForm.get('label')?.value;
          this.unitData.description = this.unitForm.get('description')?.value;
          this.unitDataChanged.emit();
        }
      });
    } else {
      this.unitForm.setValue({
        key: '',
        label: '',
        description: ''
      });
    }
  }

  editorChanged(newEditorId: string): void {
    if (this.unitData) {
      this.unitData.editorid = newEditorId;
      this.unitDataChanged.emit();
    }
  }

  playerChanged(newPlayerId: string): void {
    if (this.unitData) {
      this.unitData.playerid = newPlayerId;
      this.unitDataChanged.emit();
    }
  }

  ngOnChanges(): void {
    if (this.unitForm) this.readData();
  }

  ngOnDestroy(): void {
    if (this.unitFormDataChangedSubscription) this.unitFormDataChangedSubscription.unsubscribe();
  }
}

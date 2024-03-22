import {
  Component, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { VeronaModuleClass } from '../../models/verona-module.class';
import { TranslateModule } from '@ngx-translate/core';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField } from '@angular/material/form-field';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'studio-lite-select-module',
    templateUrl: './select-module.component.html',
    styleUrls: ['./select-module.component.scss'],
    standalone: true,
    imports: [NgIf, FormsModule, ReactiveFormsModule, MatFormField, MatSelect, NgFor, MatOption, TranslateModule]
})
export class SelectModuleComponent implements OnDestroy {
  private allModules: VeronaModuleClass[] = [];
  @Input()
  set modules(value: { [key: string]: VeronaModuleClass }) {
    this.allModules = Object.keys(value).map(m => value[m]);
    this.moduleList = this.allModules.filter(m => m.metadata.isStable ||
      !this.stableOnly || this.selectedModuleId === m.key);
    this.setData();
  }

  private _stableOnly = false;
  @Input()
  get stableOnly(): boolean {
    return this._stableOnly;
  }

  set stableOnly(value: boolean) {
    this._stableOnly = value;
    this.moduleList = this.allModules.filter(m => m.metadata.isStable ||
      !this.stableOnly || this.selectedModuleId === m.key);
    this.setData();
  }

  @Input()
  get value(): string {
    return this.selectedModuleId;
  }

  set value(value: string) {
    this.selectedModuleId = value;
    this.setData();
  }

  moduleList: VeronaModuleClass[] = [];
  selectedModuleId!: string;
  @Input() moduleType = '?';
  @Output() selectionChanged = new EventEmitter();
  hasListEntries = false;
  moduleForm: UntypedFormGroup;
  isValid = false;
  isEmpty = false;
  moduleSubstitute = '';
  private moduleFormDataChangedSubscription: Subscription | undefined;

  constructor(
    private fb: UntypedFormBuilder
  ) {
    this.moduleForm = this.fb.group({
      moduleSelector: this.fb.control('')
    });
  }

  private setData(): void {
    let newModuleSelectorValue = '';
    if (this.moduleFormDataChangedSubscription) this.moduleFormDataChangedSubscription.unsubscribe();
    this.hasListEntries = this.moduleList && this.moduleList.length > 0;
    this.isValid = true;
    this.isEmpty = true;
    this.moduleSubstitute = '';
    this.isEmpty = !this.selectedModuleId;
    if (!this.isEmpty) {
      const allKeys = this.moduleList.map(m => m.key);
      const checkModuleId = VeronaModuleFactory.isValid(this.selectedModuleId, allKeys);
      if (checkModuleId === false) {
        this.isValid = false;
      } else if (checkModuleId === true) {
        newModuleSelectorValue = this.selectedModuleId;
      } else if (this.moduleList) {
        const moduleSubstituteObjects = this.moduleList.filter(m => m.key === checkModuleId);
        this.moduleSubstitute = moduleSubstituteObjects[0].nameAndVersion;
      }
    }
    this.moduleFormDataChangedSubscription = this.moduleForm.valueChanges.subscribe(() => {
      this.selectionChanged.emit(this.moduleForm.get('moduleSelector')?.value);
      this.isEmpty = false;
    });
    this.moduleForm.setValue({ moduleSelector: newModuleSelectorValue }, { emitEvent: false });
  }

  ngOnDestroy(): void {
    if (this.moduleFormDataChangedSubscription) this.moduleFormDataChangedSubscription.unsubscribe();
  }
}

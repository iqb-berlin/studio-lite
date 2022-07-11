import {
  Component, EventEmitter, Input, OnDestroy, Output
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VeronaModuleCollection } from '../../../classes/verona-module-collection.class';

@Component({
  selector: 'app-select-module',
  templateUrl: './select-module.component.html'
})
export class SelectModuleComponent implements OnDestroy {
  @Input() moduleList = new VeronaModuleCollection([]);
  selectedModuleId!: string;
  @Input() moduleType = '?';
  @Input() stableOnly = false;
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

  setModule(newModule: string): void {
    this.selectedModuleId = newModule;
    this.setData();
  }

  private setData(): void {
    let newModuleSelectorValue = '';
    if (this.moduleFormDataChangedSubscription) this.moduleFormDataChangedSubscription.unsubscribe();
    this.hasListEntries = this.moduleList && this.moduleList.hasEntries();
    this.isValid = true;
    this.isEmpty = true;
    this.moduleSubstitute = '';
    this.isEmpty = !this.selectedModuleId;
    if (!this.isEmpty) {
      const checkModuleId = this.moduleList.isValid(this.selectedModuleId);
      if (checkModuleId === false) {
        this.isValid = false;
      } else if (checkModuleId === true) {
        newModuleSelectorValue = this.selectedModuleId;
      } else if (this.moduleList) {
        this.moduleSubstitute = this.moduleList.getNameAndVersion(checkModuleId);
      }
    }
    this.moduleFormDataChangedSubscription = this.moduleForm.valueChanges.subscribe(() => {
      this.selectionChanged.emit(this.moduleForm.get('moduleSelector')?.value);
    });
    this.moduleForm.setValue({ moduleSelector: newModuleSelectorValue }, { emitEvent: false });
  }

  ngOnDestroy(): void {
    if (this.moduleFormDataChangedSubscription) this.moduleFormDataChangedSubscription.unsubscribe();
  }
}

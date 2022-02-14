import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import { ModulData } from '../../backend.service';
import { WorkspaceService } from '../../workspace.service';
import { ModuleCollection } from '../../workspace.classes';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-select-module',
  templateUrl: './select-module.component.html'
})
export class SelectModuleComponent implements OnDestroy {
  @Input() moduleList = new ModuleCollection([]);
  selectedModuleId!: string;
  @Input() moduleType = '?';
  @Output() selectionChanged = new EventEmitter();
  hasListEntries = false;
  moduleForm: FormGroup;
  isValid = false;
  isEmpty = false;
  moduleSubstitute = '';
  private moduleFormDataChangedSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder
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
        this.moduleSubstitute = this.moduleList.getName(checkModuleId);
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

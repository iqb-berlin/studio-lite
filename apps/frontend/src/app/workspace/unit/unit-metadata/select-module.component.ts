import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModulData } from '../../backend.service';
import { WorkspaceService } from '../../workspace.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-select-module',
  templateUrl: './select-module.component.html'
})
export class SelectModuleComponent implements OnInit, OnDestroy, OnChanges {
  @Input() moduleList!: { [key: string]: ModulData; } | null;
  @Input() selectedModuleId!: string;
  @Input() moduleType = '?';
  @Output() selectionChanged = new EventEmitter();
  listLength = 0;
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

  ngOnInit(): void {
    setTimeout(() => {
      this.setData();
    });
  }

  ngOnChanges(): void {
    if (this.moduleForm) this.setData();
  }

  private setData(): void {
    let newModuleSelectorValue = '';
    if (this.moduleFormDataChangedSubscription) this.moduleFormDataChangedSubscription.unsubscribe();
    this.listLength = this.moduleList ? Object.keys(this.moduleList).length : 0;
    this.isValid = true;
    this.isEmpty = true;
    this.moduleSubstitute = '';
    if (this.selectedModuleId) {
      this.isEmpty = false;
    }
    if (!this.isEmpty) {
      const checkModuleId = WorkspaceService.validModuleId(this.selectedModuleId, this.moduleList);
      if (checkModuleId === false) {
        this.isValid = false;
      } else if (checkModuleId === true) {
        newModuleSelectorValue = this.selectedModuleId;
      } else if (this.moduleList) {
        this.moduleSubstitute = this.moduleList[checkModuleId].label;
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

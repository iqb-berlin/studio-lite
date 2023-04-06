import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Component, ElementRef, Inject, ViewChild
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { WorkspaceService } from '../../services/workspace.service';

export interface NewUnitData {
  title: string,
  subTitle: string,
  key: string,
  label: string,
  groups: string[]
}

@Component({
  selector: 'studio-lite-new-unit',
  templateUrl: './new-unit.component.html',
  styleUrls: ['./new-unit.component.scss']
})
export class NewUnitComponent {
  newUnitForm: UntypedFormGroup;
  groupDirectMode = false;
  @ViewChild('newGroupInput') newGroupInput: ElementRef | undefined;

  constructor(private fb: UntypedFormBuilder,
              public ds: WorkspaceService,
              @Inject(MAT_DIALOG_DATA) public data: NewUnitData) {
    this.newUnitForm = this.fb.group({
      key: this.fb.control(data.key, [Validators.required, Validators.pattern('[a-zA-Z-0-9_]+'),
        Validators.minLength(3),
        WorkspaceService.unitKeyUniquenessValidator(0, this.ds.unitList)]),
      label: this.fb.control(data.label),
      groupSelect: this.fb.control(''),
      groupDirect: this.fb.control('')
    });
    this.groupDirectMode = this.data.groups.length === 0;
  }

  setGroupDirectMode(b: boolean) {
    this.groupDirectMode = b;
    setTimeout(() => {
      if (b && this.newGroupInput) {
        this.newGroupInput.nativeElement.focus();
      }
    }, 100);
  }
}

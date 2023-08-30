import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Component, ElementRef, Inject, ViewChild
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { WorkspaceService } from '../../services/workspace.service';
import { NewUnitData } from '../../models/new-unit.interface';

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
      key: this.fb.control(data.key, [
        Validators.required,
        Validators.pattern('[a-zA-Z-0-9_]+'),
        Validators.minLength(3),
        Validators.maxLength(19),
        WorkspaceService.unitKeyUniquenessValidator(0, this.ds.unitList)
      ]),
      label: this.fb.control(data.label),
      groupSelect: this.fb.control(''),
      groupDirect: this.fb.control('')
    });
    this.groupDirectMode = this.data.groups.length === 0;
  }

  setGroupDirectMode(groupDirectMode: boolean) {
    this.groupDirectMode = groupDirectMode;
    setTimeout(() => {
      if (groupDirectMode && this.newGroupInput) {
        this.newGroupInput.nativeElement.focus();
      }
    }, 100);
  }
}

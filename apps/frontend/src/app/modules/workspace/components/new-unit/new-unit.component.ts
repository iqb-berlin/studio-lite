import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import {
  Component, ElementRef, Inject, ViewChild
} from '@angular/core';
import {
  UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatError } from '@angular/material/form-field';

import { NewUnitData } from '../../models/new-unit.interface';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'studio-lite-new-unit',
  templateUrl: './new-unit.component.html',
  styleUrls: ['./new-unit.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatError, MatSelect, MatOption, MatIconButton, MatTooltip, MatIcon, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
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
        Validators.maxLength(20),
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

import { Component, Inject } from '@angular/core';
import {
  UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { EditWorkspaceGroupComponentData } from '../../models/edit-workspace-group-component-data.type';

@Component({
  selector: 'studio-lite-edit-workspace-group',
  templateUrl: './edit-workspace-group.component.html',
  styleUrls: ['./edit-workspace-group.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})
export class EditWorkspaceGroupComponent {
  editWorkspaceGroupForm: UntypedFormGroup;
  name = this.data.wsg?.name || '';
  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: EditWorkspaceGroupComponentData) {
    this.editWorkspaceGroupForm = this.fb.group({
      name: this.fb.control(this.name, [Validators.required, Validators.minLength(3)])
    });
  }
}

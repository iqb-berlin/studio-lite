import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import {
  UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatInput } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { MyData } from '../../models/my-data.interface';

@Component({
  selector: 'studio-lite-edit-my-data',
  templateUrl: './edit-my-data.component.html',
  styleUrls: ['./edit-my-data.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatCheckbox, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})

export class EditMyDataComponent {
  editUserForm: UntypedFormGroup;
  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: MyData) {
    this.editUserForm = this.fb
      .group({
        lastName: this.fb.control(this.data.lastName),
        firstName: this.fb.control(this.data.firstName),
        email: this.fb.control(this.data.email),
        emailPublishApproval: this.fb.control(this.data.emailPublishApproved),
        description: this.fb.control(this.data.description)
      });
  }
}

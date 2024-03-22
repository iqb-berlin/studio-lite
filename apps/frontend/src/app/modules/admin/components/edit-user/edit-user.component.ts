import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditUserComponentData } from '../../models/edit-user-component-data.type';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
    selector: 'studio-lite-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.scss'],
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatInput, NgIf, MatIcon, MatLabel, MatCheckbox, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})

export class EditUserComponent {
  editUserForm: UntypedFormGroup;
  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: EditUserComponentData) {
    this.editUserForm = this.fb.group({
      name: this.fb.control(this.data.name,
        [Validators.required, Validators.pattern(/^[a-zäöüß]{3,}$/)]),
      lastName: this.fb.control(this.data.lastName),
      firstName: this.fb.control(this.data.firstName),
      email: this.fb.control(this.data.email),
      description: this.fb.control(this.data.description),
      isAdmin: this.fb.control(this.data.isAdmin),
      password: this.fb.control(this.data.password,
        data.newUser ?
          [Validators.pattern(/^\S{3,}$/), Validators.required] :
          [Validators.pattern(/^\S{3,}$/)])
    });
  }
}

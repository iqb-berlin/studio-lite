import { Component } from '@angular/core';
import {
  UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import {
  MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';

@Component({
  selector: 'studio-lite-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatFormField, MatLabel, MatInput, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})
export class ChangePasswordComponent {
  changePasswordForm: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder) {
    this.changePasswordForm = this.fb.group({
      pw_old: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]),
      pw_new1: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]),
      pw_new2: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)])
    });
  }
}

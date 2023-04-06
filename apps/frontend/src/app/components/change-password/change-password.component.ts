import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'studio-lite-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
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

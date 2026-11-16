import { Component, OnDestroy } from '@angular/core';
import {
  UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import {
  MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';
import { FilledErrorStateMatcher } from '../../classes/filled-error-state-matcher.class';
import { matchesControl } from '../../utils/matches-control.utils';

@Component({
  selector: 'studio-lite-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],

  imports: [FormsModule, ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatFormField, MatLabel, MatInput,
    MatDialogActions, MatButton, MatDialogClose, TranslateModule, MatError],
  providers: [{ provide: ErrorStateMatcher, useClass: FilledErrorStateMatcher }]
})
export class ChangePasswordComponent implements OnDestroy {
  changePasswordForm: UntypedFormGroup;
  private ngUnsubscribe = new Subject<void>();

  constructor(private fb: UntypedFormBuilder) {
    const rules = [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)];
    const newPassword = this.fb.control('', rules);
    const repetition = this.fb.control('', [...rules, matchesControl('pw_new1')]);
    this.changePasswordForm = this.fb.group({
      pw_old: this.fb.control('', rules),
      pw_new1: newPassword,
      pw_new2: repetition
    });
    // the repetition is judged against the new password, so a change there judges it again
    newPassword.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => repetition.updateValueAndValidity());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

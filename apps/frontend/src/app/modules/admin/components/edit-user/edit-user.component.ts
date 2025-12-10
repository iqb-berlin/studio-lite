import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import {
  UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';

import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { EditUserComponentData } from '../../models/edit-user-component-data.type';
import { AppService } from '../../../../services/app.service';

@Component({
  selector: 'studio-lite-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, FormsModule, ReactiveFormsModule,
    MatFormField, MatInput, MatIcon, MatLabel, MatCheckbox, MatDialogActions, MatSuffix,
    MatButton, MatDialogClose, TranslateModule, MatTooltip, MatMiniFabButton]
})

export class EditUserComponent {
  editUserForm: UntypedFormGroup;
  constructor(private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: EditUserComponentData,
              private appService: AppService) {
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

  // eslint-disable-next-line class-methods-use-this
  setPasswordInputType(input: HTMLInputElement): void {
    input.type = input.type === 'text' ? 'password' : 'text';
  }

  setGeneratePassword(input: HTMLInputElement): void {
    this.editUserForm
      .get('password')?.setValue(EditUserComponent.generatePassword());
    input.type = 'text';
  }

  private static generatePassword(length = 8): string {
    const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#$%&*-_+=:?';
    return Array.from({ length }, () => {
      const buf = new Uint8Array(1);
      const maxValid = 256 - (256 % CHARSET.length);
      let rnd = 0;
      do {
        crypto.getRandomValues(buf);
        rnd = buf[0];
      } while (rnd >= maxValid);
      return CHARSET.charAt(rnd % CHARSET.length);
    }).join('');
  }

  mailTo(): void {
    const email: string = this.editUserForm.get('email')?.value || '';
    const subject: string = this.appService.appConfig.emailSubject;
    window.location.href = `mailto:${email}?subject=${subject}&body=${this.getEmailBody()}`;
  }

  private getEmailBody(): string {
    const template = this.appService.appConfig.emailBody;
    const firstName = this.editUserForm.get('firstName')?.value || '';
    const lastName = this.editUserForm.get('lastName')?.value || '';
    const name = this.editUserForm.get('name')?.value || '';
    const password = this.editUserForm.get('password')?.value || '';

    const result = EditUserComponent.fillTemplate(template, {
      firstname: firstName,
      lastname: lastName,
      user: name,
      password: password
    });
    return encodeURIComponent(result);
  }

  private static fillTemplate(template: string, data: { [key: string]: string }): string {
    return template
      .replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] ?? '');
  }
}

import {
  Component, OnDestroy, OnInit, signal
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';

import { EmailTemplateDto } from '@studio-lite-lib/api-dto';
import { BackendService } from '../../../../services/backend.service';

@Component({
  selector: 'studio-lite-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.scss'],

  imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, CdkTextareaAutosize, MatButton, TranslateModule]
})

export class EmailTemplateComponent implements OnInit, OnDestroy {
  configForm: UntypedFormGroup;
  dataChanged = false;
  private readonly savingState = signal(false);
  // While a save is under way the button is locked, and what is entered meanwhile stays a change (#2094).
  readonly saving = this.savingState.asReadonly();
  private configDataChangedSubscription: Subscription | null = null;

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    private translateService: TranslateService
  ) {
    this.configForm = this.fb.group({
      emailSubject: this.fb.control(''),
      emailBody: this.fb.control('')
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateFormFields();
    });
  }

  updateFormFields(): void {
    this.backendService.getEmailTemplate()
      .subscribe(emailTemplate => {
        if (this.configDataChangedSubscription !== null) {
          this.configDataChangedSubscription.unsubscribe();
          this.configDataChangedSubscription = null;
        }
        if (emailTemplate) {
          if (this.configForm) {
            this.configForm.setValue({
              emailSubject: emailTemplate.emailSubject,
              emailBody: emailTemplate.emailBody
            }, { emitEvent: false });
          }
        } else {
          this.configForm.setValue({ emailSubject: '', emailBody: '' });
        }
        this.configDataChangedSubscription = this.configForm.valueChanges.subscribe(() => {
          if (this.configForm) {
            this.dataChanged = true;
          }
        });
      });
  }

  saveData(): void {
    if (this.saving()) return;
    if (this.configForm) {
      const sent = JSON.stringify(this.configForm.getRawValue());
      const emailTemplate: EmailTemplateDto = {
        emailSubject: this.configForm.get('emailSubject')?.value,
        emailBody: this.configForm.get('emailBody')?.value
      };
      this.savingState.set(true);
      this.backendService.setEmailTemplate(emailTemplate)
        .subscribe(isOk => {
          this.savingState.set(false);
          if (isOk) {
            this.snackBar.open(
              this.translateService.instant('email-template.template-saved'),
              '',
              { duration: 3000 }
            );
            this.dataChanged = JSON.stringify(this.configForm.getRawValue()) !== sent;
          } else {
            this.snackBar.open(
              this.translateService.instant('email-template.template-not-saved'),
              this.translateService.instant('error'),
              { duration: 3000 }
            );
          }
        });
    }
  }

  ngOnDestroy(): void {
    if (this.configDataChangedSubscription !== null) this.configDataChangedSubscription.unsubscribe();
  }
}

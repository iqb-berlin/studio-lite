import {
  Component, inject, OnDestroy, OnInit, signal
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { DEFAULT_UI_LANGUAGE, LOCALIZED_EMAIL_TEMPLATE_TEXTS } from '@studio-lite/shared-code';

import { EmailTemplateDto } from '@studio-lite-lib/api-dto';
import { BackendService } from '../../../../services/backend.service';
import { SaveLock } from '../../../../classes/save-lock.class';
import { LanguageService } from '../../../../services/language.service';
import {
  localizedFormValue, localizedTextsForm, localizedTextsFromForm
} from '../../../../utils/localized-form.utils';

@Component({
  selector: 'studio-lite-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.scss'],

  imports: [
    FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, CdkTextareaAutosize, MatButton, TranslateModule,
    MatTabGroup, MatTab, MatTabLabel
  ]
})

export class EmailTemplateComponent implements OnInit, OnDestroy {
  configForm: UntypedFormGroup;
  readonly languages = inject(LanguageService).languages;
  readonly defaultLanguage = DEFAULT_UI_LANGUAGE;
  // What is stored, so that saving keeps the texts of a language the form does not show (#1964).
  // A plain object: the DTO class would bring the API's decorators into the bundle.
  private emailTemplate: EmailTemplateDto = { emailSubject: {}, emailBody: {} };
  dataChanged = false;
  // One save at a time, and what it sent: what is entered meanwhile stays a change (#2094).
  readonly save = new SaveLock();
  private configDataChangedSubscription: Subscription | null = null;
  private readonly templateNotLoadedState = signal(false);
  // Without the stored template the form is not shown: its empty fields would look like no template stored (#2188).
  readonly templateNotLoaded = this.templateNotLoadedState.asReadonly();
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    private translateService: TranslateService
  ) {
    this.configForm = localizedTextsForm(this.fb, this.languages, LOCALIZED_EMAIL_TEMPLATE_TEXTS);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateFormFields();
    });
  }

  updateFormFields(): void {
    this.backendService.getEmailTemplate()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(emailTemplate => {
        if (this.configDataChangedSubscription !== null) {
          this.configDataChangedSubscription.unsubscribe();
          this.configDataChangedSubscription = null;
        }
        this.templateNotLoadedState.set(!emailTemplate);
        if (emailTemplate) {
          this.emailTemplate = emailTemplate;
          this.configForm.setValue(
            localizedFormValue(this.emailTemplate, this.languages, LOCALIZED_EMAIL_TEMPLATE_TEXTS),
            { emitEvent: false }
          );
          this.configDataChangedSubscription = this.configForm.valueChanges.subscribe(() => {
            if (this.configForm) {
              this.dataChanged = true;
            }
          });
        }
      });
  }

  saveData(): void {
    if (this.configForm) {
      if (!this.save.start(this.configForm.getRawValue())) return;
      const emailTemplate: EmailTemplateDto = localizedTextsFromForm(
        this.emailTemplate,
        this.configForm.getRawValue(),
        LOCALIZED_EMAIL_TEMPLATE_TEXTS
      );
      this.backendService.setEmailTemplate(emailTemplate)
        .subscribe(isOk => {
          this.save.finish();
          if (isOk) {
            this.snackBar.open(
              this.translateService.instant('email-template.template-saved'),
              '',
              { duration: 3000 }
            );
            this.dataChanged = this.save.differsFromSent(this.configForm.getRawValue());
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';

import { ToTimePipe } from '../../pipes/to-time.pipe';
import { AppConfig } from '../../../../models/app-config.class';
import { defaultAppConfig } from '../../../../services/app.service';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';

@Component({
  selector: 'studio-lite-app-config',
  templateUrl: './app-config.component.html',
  styleUrls: ['./app-config.component.scss'],
  // eslint-disable-next-line max-len
  imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatSelect, MatOption, CdkTextareaAutosize, MatButton, TranslateModule, ToTimePipe]
})

export class AppConfigComponent implements OnInit, OnDestroy {
  appConfig = defaultAppConfig;

  configForm: UntypedFormGroup;
  dataChanged = false;
  private configDataChangedSubscription: Subscription | null = null;
  warningIsExpired = false;
  expiredHours: number[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private writeBackendService: WriteBackendService,
    private readBackendService: ReadBackendService,
    private translateService: TranslateService
  ) {
    this.configForm = this.fb.group({
      appTitle: this.fb.control(''),
      introHtml: this.fb.control(''),
      imprintHtml: this.fb.control(''),
      emailSubject: this.fb.control(''),
      emailBody: this.fb.control(''),
      globalWarningText: this.fb.control(''),
      globalWarningExpiredDay: this.fb.control(new Date()),
      globalWarningExpiredHour: this.fb.control('')
    });
    this.createExpiredHours();
  }

  private createExpiredHours(): void {
    for (let i = 0; i < 24; i++) {
      this.expiredHours.push(i);
    }
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateFormFields();
    });
  }

  updateFormFields(): void {
    this.readBackendService.getConfig().subscribe(appConfig => {
      if (this.configDataChangedSubscription !== null) {
        this.configDataChangedSubscription.unsubscribe();
        this.configDataChangedSubscription = null;
      }
      if (appConfig && this.appConfig) {
        if (appConfig.appTitle) this.appConfig.appTitle = appConfig.appTitle;
        if (appConfig.introHtml) this.appConfig.introHtml = appConfig.introHtml;
        if (appConfig.imprintHtml) this.appConfig.imprintHtml = appConfig.imprintHtml;
        this.appConfig.emailSubject = appConfig.emailSubject;
        this.appConfig.emailBody = appConfig.emailBody;
        if (appConfig.globalWarningText) this.appConfig.globalWarningText = appConfig.globalWarningText;
        if (appConfig.globalWarningExpiredDay) {
          this.appConfig.globalWarningExpiredDay = appConfig.globalWarningExpiredDay;
        }
        if (appConfig.globalWarningExpiredHour) {
          this.appConfig.globalWarningExpiredHour = appConfig.globalWarningExpiredHour;
        }
        if (this.configForm) {
          this.configForm.setValue({
            appTitle: this.appConfig.appTitle,
            introHtml: this.appConfig.introHtml,
            imprintHtml: this.appConfig.imprintHtml,
            emailSubject: this.appConfig.emailSubject,
            emailBody: this.appConfig.emailBody,
            globalWarningText: this.appConfig.globalWarningText,
            globalWarningExpiredDay: this.appConfig.globalWarningExpiredDay,
            globalWarningExpiredHour: this.appConfig.globalWarningExpiredHour
          }, { emitEvent: false });
        }
      }
      this.warningIsExpired = AppConfig.isExpired(
        this.appConfig.globalWarningExpiredDay,
        this.appConfig.globalWarningExpiredHour
      );
      if (this.configForm) {
        this.configDataChangedSubscription = this.configForm.valueChanges.subscribe(() => {
          if (this.configForm && this.appConfig) {
            this.appConfig.globalWarningExpiredDay = this.configForm.get('globalWarningExpiredDay')?.value;
            this.appConfig.globalWarningExpiredHour = this.configForm.get('globalWarningExpiredHour')?.value;
            this.warningIsExpired = AppConfig.isExpired(
              this.appConfig.globalWarningExpiredDay,
              this.appConfig.globalWarningExpiredHour
            );
            this.dataChanged = true;
          }
        });
      }
    });
  }

  saveData(): void {
    if (this.appConfig && this.configForm) {
      this.appConfig.appTitle = this.configForm.get('appTitle')?.value;
      this.appConfig.introHtml = this.configForm.get('introHtml')?.value;
      this.appConfig.imprintHtml = this.configForm.get('imprintHtml')?.value;
      this.appConfig.emailSubject = this.configForm.get('emailSubject')?.value;
      this.appConfig.emailBody = this.configForm.get('emailBody')?.value;
      this.appConfig.globalWarningText = this.configForm.get('globalWarningText')?.value;
      this.appConfig.globalWarningExpiredDay = this.configForm.get('globalWarningExpiredDay')?.value;
      this.appConfig.globalWarningExpiredHour = this.configForm.get('globalWarningExpiredHour')?.value;
      this.writeBackendService.setAppConfig(this.appConfig).subscribe(isOk => {
        if (isOk) {
          this.snackBar.open(
            this.translateService.instant('config.config-data-saved'),
            '',
            { duration: 3000 }
          );
          this.dataChanged = false;
        } else {
          this.snackBar.open(
            this.translateService.instant('config.config-data-not-saved'),
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

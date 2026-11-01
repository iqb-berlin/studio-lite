import {
  Component, OnDestroy, OnInit, signal
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';

import { ToTimePipe } from '../../pipes/to-time.pipe';
import { AppConfig } from '../../../../classes/app-config.class';
import { defaultAppConfig } from '../../../../services/app.service';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'studio-lite-app-config',
  templateUrl: './app-config.component.html',
  styleUrls: ['./app-config.component.scss'],

  imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatSelect, MatOption, CdkTextareaAutosize, MatButton, TranslateModule, ToTimePipe]
})

export class AppConfigComponent implements OnInit, OnDestroy {
  // A copy: the default is shared, among others with the start page, and this form writes into it (#1964).
  appConfig = { ...defaultAppConfig };

  configForm: UntypedFormGroup;
  dataChanged = false;
  private readonly savingState = signal(false);
  // While a save is under way the button is locked, and what is entered meanwhile stays a change (#2094).
  readonly saving = this.savingState.asReadonly();
  private configDataChangedSubscription: Subscription | null = null;
  private readonly configNotLoadedState = signal(false);
  // Without the stored config the form is not shown: saving it would replace that config (#1968).
  readonly configNotLoaded = this.configNotLoadedState.asReadonly();
  private ngUnsubscribe = new Subject<void>();
  warningIsExpired = false;
  expiredHours: number[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    private translateService: TranslateService
  ) {
    this.configForm = this.fb.group({
      appTitle: this.fb.control(''),
      introHtml: this.fb.control(''),
      imprintHtml: this.fb.control(''),
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
    this.updateFormFields();
  }

  updateFormFields(): void {
    this.backendService.getAppConfig().pipe(takeUntil(this.ngUnsubscribe)).subscribe(appConfig => {
      if (this.configDataChangedSubscription !== null) {
        this.configDataChangedSubscription.unsubscribe();
        this.configDataChangedSubscription = null;
      }
      this.configNotLoadedState.set(!appConfig);
      if (appConfig) {
        // Taken whole, so that a text emptied by an admin stays empty and saving keeps the loaded
        // fields the form does not show (#1964).
        this.appConfig = {
          ...defaultAppConfig,
          ...appConfig,
          globalWarningExpiredDay: appConfig.globalWarningExpiredDay ?
            new Date(appConfig.globalWarningExpiredDay) : defaultAppConfig.globalWarningExpiredDay
        };
        if (this.configForm) {
          this.configForm.setValue({
            appTitle: this.appConfig.appTitle,
            introHtml: this.appConfig.introHtml,
            imprintHtml: this.appConfig.imprintHtml,
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
    if (this.saving()) return;
    if (this.appConfig && this.configForm) {
      const sent = JSON.stringify(this.configForm.getRawValue());
      this.appConfig.appTitle = this.configForm.get('appTitle')?.value;
      this.appConfig.introHtml = this.configForm.get('introHtml')?.value;
      this.appConfig.imprintHtml = this.configForm.get('imprintHtml')?.value;
      this.appConfig.globalWarningText = this.configForm.get('globalWarningText')?.value;
      this.appConfig.globalWarningExpiredDay = this.configForm.get('globalWarningExpiredDay')?.value;
      this.appConfig.globalWarningExpiredHour = this.configForm.get('globalWarningExpiredHour')?.value;
      this.savingState.set(true);
      this.backendService.setAppConfig(this.appConfig).subscribe(isOk => {
        this.savingState.set(false);
        if (isOk) {
          this.snackBar.open(
            this.translateService.instant('config.config-data-saved'),
            '',
            { duration: 3000 }
          );
          this.dataChanged = JSON.stringify(this.configForm.getRawValue()) !== sent;
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

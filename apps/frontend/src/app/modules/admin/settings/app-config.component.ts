import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BackendService as WriteBackendService } from '../backend.service';
import { BackendService as ReadBackendService } from '../../../services/backend.service';
import { defaultAppConfig } from '../../../services/app.service';
import { AppConfig } from '../../../classes/app-config.class';

@Component({
  selector: 'app-app-config',
  templateUrl: 'app-config.component.html',
  styles: [
    '.example-chip-list {width: 100%;}',
    '.block-ident {margin-left: 40px}',
    '.warning-warning { color: darkgoldenrod }',
    '.save-button {margin-bottom: 20px}'
  ]
})

export class AppConfigComponent implements OnInit, OnDestroy {
  appConfig = defaultAppConfig;

  configForm: UntypedFormGroup;
  dataChanged = false;
  private configDataChangedSubscription: Subscription | null = null;
  warningIsExpired = false;
  expiredHours = {
    '': '',
    '01': '01:00 Uhr',
    '02': '02:00 Uhr',
    '03': '03:00 Uhr',
    '04': '04:00 Uhr',
    '05': '05:00 Uhr',
    '06': '06:00 Uhr',
    '07': '07:00 Uhr',
    '08': '08:00 Uhr',
    '09': '09:00 Uhr',
    10: '10:00 Uhr',
    11: '11:00 Uhr',
    12: '12:00 Uhr',
    13: '13:00 Uhr',
    14: '14:00 Uhr',
    15: '15:00 Uhr',
    16: '16:00 Uhr',
    17: '17:00 Uhr',
    18: '18:00 Uhr',
    19: '19:00 Uhr',
    20: '20:00 Uhr',
    21: '21:00 Uhr',
    22: '22:00 Uhr',
    23: '23:00 Uhr'
  };

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private writeBackendService: WriteBackendService,
    private readBackendService: ReadBackendService
  ) {
    this.configForm = this.fb.group({
      appTitle: this.fb.control(''),
      introHtml: this.fb.control(''),
      imprintHtml: this.fb.control(''),
      globalWarningText: this.fb.control(''),
      globalWarningExpiredDay: this.fb.control(new Date()),
      globalWarningExpiredHour: this.fb.control('')
    });
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
      this.appConfig.globalWarningText = this.configForm.get('globalWarningText')?.value;
      this.appConfig.globalWarningExpiredDay = this.configForm.get('globalWarningExpiredDay')?.value;
      this.appConfig.globalWarningExpiredHour = this.configForm.get('globalWarningExpiredHour')?.value;
      this.writeBackendService.setAppConfig(this.appConfig).subscribe(isOk => {
        if (isOk) {
          this.snackBar.open(
            'Konfigurationsdaten der Anwendung gespeichert - bitte neu laden!', 'Info', { duration: 3000 }
          );
          this.dataChanged = false;
        } else {
          this.snackBar.open('Konnte Konfigurationsdaten der Anwendung nicht speichern', 'Fehler', { duration: 3000 });
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.configDataChangedSubscription !== null) this.configDataChangedSubscription.unsubscribe();
  }
}

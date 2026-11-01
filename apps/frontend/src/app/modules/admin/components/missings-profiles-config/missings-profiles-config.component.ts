import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { BackendService } from '../../services/backend.service';
import { SaveLock } from '../../../../classes/save-lock.class';

@Component({
  selector: 'studio-lite-missings-profiles-config',
  templateUrl: './missings-profiles-config.component.html',
  styleUrls: ['./missings-profiles-config.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, TranslateModule]
})

export class MissingsProfilesConfigComponent implements OnInit, OnDestroy {
  configForm: UntypedFormGroup;
  dataChanged = false;
  // One save at a time, and what it sent: what is entered meanwhile stays a change (#2094).
  readonly save = new SaveLock();
  private configDataChangedSubscription: Subscription | null = null;

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    private translateService: TranslateService
  ) {
    this.configForm = this.fb.group({
      iqbStandardMissings: this.fb.control('[]')
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateFormFields();
    });
  }

  updateFormFields(): void {
    this.backendService.getMissingsProfiles().subscribe(missingsProfiles => {
      if (this.configDataChangedSubscription !== null) {
        this.configDataChangedSubscription.unsubscribe();
        this.configDataChangedSubscription = null;
      }
      if (missingsProfiles.length > 0) {
        this.configForm.setValue({
          iqbStandardMissings: missingsProfiles[0].missings
        });
      }
      this.configDataChangedSubscription = this.configForm.valueChanges.subscribe(() => {
        if (this.configForm) {
          this.dataChanged = true;
        }
      });
    });
  }

  saveData(): void {
    if (this.configForm) {
      try {
        const parsedJSON = JSON.parse(this.configForm.get('iqbStandardMissings')?.value);
        const missings = JSON.stringify(parsedJSON);
        if (!this.save.start(this.configForm.getRawValue())) return;
        this.backendService.setMissingsProfiles([{
          label: 'IQB-Standard',
          missings: missings
        }])
          .subscribe(isOk => {
            this.save.finish();
            if (isOk) {
              this.snackBar.open(
                this.translateService.instant('missings-profiles-config.profiles-saved'),
                '',
                { duration: 3000 }
              );
              this.dataChanged = this.save.differsFromSent(this.configForm.getRawValue());
            } else {
              this.snackBar.open(
                this.translateService.instant('missings-profiles-config.profiles-not-saved'),
                this.translateService.instant('error'),
                { duration: 3000 }
              );
            }
          });
      } catch {
        this.snackBar.open(
          this.translateService.instant('missings-profiles-config.not-valid-json'),
          this.translateService.instant('error'),
          { duration: 3000 }
        );
      }
    }
  }

  ngOnDestroy(): void {
    if (this.configDataChangedSubscription !== null) this.configDataChangedSubscription.unsubscribe();
  }
}

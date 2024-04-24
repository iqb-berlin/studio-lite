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

@Component({
  selector: 'studio-lite-missings-profiles-config',
  templateUrl: './missings-profiles-config.component.html',
  styleUrls: ['./missings-profiles-config.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, TranslateModule]
})

export class MissingsProfilesConfigComponent implements OnInit, OnDestroy {
  configForm: UntypedFormGroup;
  dataChanged = false;
  private configDataChangedSubscription: Subscription | null = null;

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    private translateService: TranslateService
  ) {
    this.configForm = this.fb.group({
      iqbStandardMissings: this.fb.control('')
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
      this.configForm.setValue({
        iqbStandardMissings: missingsProfiles[0].missings
      });
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
        this.backendService.setMissingsProfiles([{
          id: 1,
          label: 'IQB-Standard',
          missings: missings
        }])
          .subscribe(isOk => {
            if (isOk) {
              this.snackBar.open(
                this.translateService.instant('unit-export-config.params-saved'),
                '',
                { duration: 3000 }
              );
              this.dataChanged = false;
            } else {
              this.snackBar.open(
                this.translateService.instant('unit-export-config.params-not-saved'),
                this.translateService.instant('error'),
                { duration: 3000 }
              );
            }
          });
      } catch {
        this.snackBar.open(
          this.translateService.instant('unit-export-config.not-valid-json'),
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

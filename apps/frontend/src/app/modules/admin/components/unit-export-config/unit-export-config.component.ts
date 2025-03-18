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
    selector: 'studio-lite-unit-export-config',
    templateUrl: './unit-export-config.component.html',
    styleUrls: ['./unit-export-config.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, TranslateModule]
})

export class UnitExportConfigComponent implements OnInit, OnDestroy {
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
      unitXsdUrl: this.fb.control(''),
      bookletXsdUrl: this.fb.control(''),
      testTakersXsdUrl: this.fb.control('')
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateFormFields();
    });
  }

  updateFormFields(): void {
    this.backendService.getUnitExportConfig().subscribe(unitExportConfig => {
      if (this.configDataChangedSubscription !== null) {
        this.configDataChangedSubscription.unsubscribe();
        this.configDataChangedSubscription = null;
      }
      this.configForm.setValue({
        unitXsdUrl: unitExportConfig.unitXsdUrl,
        bookletXsdUrl: unitExportConfig.bookletXsdUrl,
        testTakersXsdUrl: unitExportConfig.testTakersXsdUrl
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
      this.backendService.setUnitExportConfig({
        unitXsdUrl: this.configForm.get('unitXsdUrl')?.value,
        bookletXsdUrl: this.configForm.get('bookletXsdUrl')?.value,
        testTakersXsdUrl: this.configForm.get('testTakersXsdUrl')?.value
      }).subscribe(isOk => {
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
    }
  }

  ngOnDestroy(): void {
    if (this.configDataChangedSubscription !== null) this.configDataChangedSubscription.unsubscribe();
  }
}

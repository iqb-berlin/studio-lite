import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'studio-lite-unit-export-config',
  templateUrl: './unit-export-config.component.html',
  styleUrls: ['./unit-export-config.component.scss']
})

export class UnitExportConfigComponent implements OnInit, OnDestroy {
  configForm: UntypedFormGroup;
  dataChanged = false;
  private configDataChangedSubscription: Subscription | null = null;

  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private backendService: BackendService
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
            'Parameter für Unitexport gespeichert.', 'Info', { duration: 3000 }
          );
          this.dataChanged = false;
        } else {
          this.snackBar.open('Konnte Parameter für Unitexport nicht speichern', 'Fehler', { duration: 3000 });
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.configDataChangedSubscription !== null) this.configDataChangedSubscription.unsubscribe();
  }
}

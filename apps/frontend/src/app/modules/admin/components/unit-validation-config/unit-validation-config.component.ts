import {
  Component, OnDestroy, OnInit, signal
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { UnitValidationDto } from '@studio-lite-lib/api-dto';
import { areValidUnitSizeLevels, DEFAULT_UNIT_SIZE_LEVELS } from '@studio-lite/shared-code';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';
import { SaveLock } from '../../../../classes/save-lock.class';

// the same test as the API's, which refuses what the form would let through
const risingSizeLevels = (group: AbstractControl): ValidationErrors | null => (
  areValidUnitSizeLevels(group.getRawValue()) ? null : { sizeLevels: true });

const sizeControl = (value: number) => new FormControl<number | null>(value);

/**
 * What an administrator sets for the technical validation of units (#2229): so far where the levels
 * of a unit's size begin, in KB. Later settings of the validation join this card.
 */
@Component({
  selector: 'studio-lite-unit-validation-config',
  templateUrl: './unit-validation-config.component.html',
  styleUrls: ['./unit-validation-config.component.scss'],
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, TranslateModule]
})
export class UnitValidationConfigComponent implements OnInit, OnDestroy {
  readonly sizeLevels = new FormGroup({
    mediumFromKb: sizeControl(DEFAULT_UNIT_SIZE_LEVELS.mediumFromKb),
    largeFromKb: sizeControl(DEFAULT_UNIT_SIZE_LEVELS.largeFromKb),
    veryLargeFromKb: sizeControl(DEFAULT_UNIT_SIZE_LEVELS.veryLargeFromKb)
  }, { validators: risingSizeLevels });

  private readonly dataChangedState = signal(false);
  readonly dataChanged = this.dataChangedState.asReadonly();
  private readonly invalidState = signal(false);
  // whether the bounds can be stored, for the button and the message beside it
  readonly invalid = this.invalidState.asReadonly();
  // One save at a time, and what it sent: what is entered meanwhile stays a change (#2094).
  readonly save = new SaveLock();
  // Without the stored levels no fields are shown, neither while they load nor where they could not be
  // read: the defaults in them would claim to be stored, and what is typed meanwhile would be set back.
  private readonly loadedState = signal(false);
  readonly loaded = this.loadedState.asReadonly();
  private readonly notLoadedState = signal(false);
  readonly notLoaded = this.notLoadedState.asReadonly();
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private readBackendService: ReadBackendService,
    private writeBackendService: WriteBackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.readBackendService.getUnitValidation().pipe(takeUntil(this.ngUnsubscribe)).subscribe(validation => {
      this.notLoadedState.set(!validation);
      if (validation) {
        this.sizeLevels.setValue(validation.sizeLevels, { emitEvent: false });
        this.loadedState.set(true);
      }
    });
    this.sizeLevels.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.dataChangedState.set(true);
      this.invalidState.set(this.sizeLevels.invalid);
    });
  }

  saveData(): void {
    const sizeLevels = this.sizeLevels.getRawValue();
    if (!areValidUnitSizeLevels(sizeLevels)) return;
    const validation: UnitValidationDto = { sizeLevels };
    if (!this.save.start(validation)) return;
    this.writeBackendService.setUnitValidation(validation).pipe(takeUntil(this.ngUnsubscribe)).subscribe(isOk => {
      this.save.finish();
      if (isOk) {
        this.snackBar.open(this.translateService.instant('unit-validation.saved'), '', { duration: 3000 });
        this.dataChangedState.set(this.save.differsFromSent({ sizeLevels: this.sizeLevels.getRawValue() }));
      } else {
        this.snackBar.open(
          this.translateService.instant('unit-validation.not-saved'),
          this.translateService.instant('error'),
          { duration: 3000 }
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

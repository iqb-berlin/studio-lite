import {
  Component, OnDestroy, OnInit, signal
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { EffectsDto } from '@studio-lite-lib/api-dto';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';
import { SaveLock } from '../../../../classes/save-lock.class';

/**
 * The effects an administrator switches on, so far the snow on the start page (#2221). They are a
 * setting of their own and not part of the config the texts card saves: that card writes the config
 * back whole, with what it loaded, and would switch the snow off again.
 */
@Component({
  selector: 'studio-lite-effects-config',
  templateUrl: './effects-config.component.html',
  styleUrls: ['./effects-config.component.scss'],
  imports: [ReactiveFormsModule, MatSlideToggle, MatButton, TranslateModule]
})
export class EffectsConfigComponent implements OnInit, OnDestroy {
  // Locked until the stored effects are in: a switch moved before would be set back by them.
  readonly snowfall = new FormControl({ value: false, disabled: true }, { nonNullable: true });
  private readonly dataChangedState = signal(false);
  readonly dataChanged = this.dataChangedState.asReadonly();
  // One save at a time, and what it sent: what is switched meanwhile stays a change (#2094).
  readonly save = new SaveLock();
  private readonly notLoadedState = signal(false);
  // Without the stored effects no switch is shown: switched off, it would claim that no snow falls.
  readonly notLoaded = this.notLoadedState.asReadonly();
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private readBackendService: ReadBackendService,
    private writeBackendService: WriteBackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.readBackendService.getEffects().pipe(takeUntil(this.ngUnsubscribe)).subscribe(effects => {
      this.notLoadedState.set(!effects);
      if (effects) {
        this.snowfall.setValue(effects.snowfall === true, { emitEvent: false });
        this.snowfall.enable({ emitEvent: false });
      }
    });
    this.snowfall.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.dataChangedState.set(true);
    });
  }

  saveData(): void {
    const effects: EffectsDto = { snowfall: this.snowfall.value };
    if (!this.save.start(effects)) return;
    this.writeBackendService.setEffects(effects).subscribe(isOk => {
      this.save.finish();
      if (isOk) {
        this.snackBar.open(this.translateService.instant('effects.saved'), '', { duration: 3000 });
        this.dataChangedState.set(this.save.differsFromSent({ snowfall: this.snowfall.value }));
      } else {
        this.snackBar.open(
          this.translateService.instant('effects.not-saved'),
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

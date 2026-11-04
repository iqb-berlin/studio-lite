import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

/**
 * The message after a change the user asked for: the success text for a second, or the error text
 * with an error label for three. Every caller decides itself what follows -- reloading a list,
 * resetting a selection, ending the loading state.
 */
@Injectable({
  providedIn: 'root'
})
export class ChangeResultService {
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);

  /**
   * Shows how the change went, both texts as translation keys.
   * @param errorLabelKey The label beside the error text; the areas name it differently.
   */
  show(ok: boolean, successKey: string, errorKey: string, errorLabelKey = 'error'): void {
    if (ok) {
      this.snackBar.open(
        this.translateService.instant(successKey),
        '',
        { duration: 1000 }
      );
    } else {
      this.snackBar.open(
        this.translateService.instant(errorKey),
        this.translateService.instant(errorLabelKey),
        { duration: 3000 }
      );
    }
  }
}

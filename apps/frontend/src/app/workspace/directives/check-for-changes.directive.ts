import { Directive } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';

@Directive({
  selector: '[studioLiteCheckForChanges]'
})
export abstract class CheckForChangesDirective {
  protected abstract confirmDiscardChangesDialog: MatDialog;

  async checkForChangesAndContinue(changed: boolean): Promise<boolean> {
    if (!changed) return true;
    const dialogResult = await lastValueFrom(this.confirmDiscardChangesDialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: 'Verwerfen der Änderungen',
          content: 'Die Änderungen an der Aufgabenfolge werden verworfen. Fortsetzen?',
          confirmButtonLabel: 'Verwerfen',
          showCancel: true
        }
      }).afterClosed());
    return dialogResult !== false;
  }
}

import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { SaveOrDiscardComponent } from '../components/save-or-discard/save-or-discard.component';
import { WorkspaceService } from '../services/workspace.service';
import { ConfirmDialogData } from '../models/confirm-dialog.interface';

/**
 * Stops unsaved work from being lost when a unit is left: it asks whether to save, discard or stay,
 * and only lets the navigation through once that is answered. Saving from here reports its outcome,
 * so a failed save keeps the user on the unit rather than dropping the changes silently.
 *
 * Only asked of someone who may write; a reader has nothing to save. A form the studio considers
 * incomplete is offered with a warning rather than refused -- the unit may be saved half-finished.
 */
@Injectable({
  providedIn: 'root'
})
export class UnitRoutingCanDeactivateGuard {
  constructor(
    public confirmDialog: MatDialog,
    private snackBar: MatSnackBar,
    public workspaceService: WorkspaceService,
    private translateService: TranslateService
  ) { }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.workspaceService.isChanged() && this.workspaceService.userAccessLevel > 1) {
      const isValid = this.workspaceService.isValidFormKey.value;
      const hasWarning = !isValid;
      const content = isValid ?
        this.translateService.instant('workspace.save-unit-data-changes') :
        this.translateService.instant('workspace.save-unit-data-changes-warning');

      const dialogRef = this.confirmDialog.open(SaveOrDiscardComponent, {
        width: '500px',
        data: <ConfirmDialogData> {
          title: this.translateService.instant('workspace.save'),
          content: content,
          confirmButtonLabel: this.translateService.instant('workspace.save'),
          confirmButtonReturn: 'YES',
          confirmButton2Label: this.translateService.instant('workspace.reject-changes-label'),
          confirmButton2Return: 'NO',
          warning: hasWarning
        }
      });
      return dialogRef.afterClosed().pipe(
        switchMap(result => {
          switch (result) {
            case false:
              return of(false);

            case 'NO':
              return of(true);

            case 'YES':
              return from(this.workspaceService.saveUnitData()).pipe(
                map(saveResult => {
                  const message = saveResult ?
                    this.translateService.instant(
                      'workspace.unit-saved'
                    ) :
                    this.translateService.instant(
                      'workspace.unit-not-saved'
                    );
                  this.snackBar.open(message, '', { duration: 1000 });
                  return saveResult;
                })
              );

            default:
              return of(false);
          }
        })
      );
    }
    return of(true);
  }
}

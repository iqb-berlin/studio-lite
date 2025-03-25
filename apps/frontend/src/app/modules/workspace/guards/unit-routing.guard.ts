import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, map, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { SaveOrDiscardComponent } from '../components/save-or-discard/save-or-discard.component';
import { WorkspaceService } from '../services/workspace.service';
import { ConfirmDialogData } from '../models/confirm-dialog.interface';

@Injectable()
export class UnitRoutingCanDeactivateGuard {
  constructor(
    public confirmDialog: MatDialog,
    private snackBar: MatSnackBar,
    public workspaceService: WorkspaceService,
    private translateService: TranslateService
  ) { }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.workspaceService.isChanged() && this.workspaceService.userAccessLevel > 1) {
      let content = '';
      let isWarning = true;

      this.workspaceService.isValidFormKey.pipe(
        map(isValid => ({
          isWarning: !isValid,
          content: isValid ?
            this.translateService.instant('workspace.save-unit-data-changes') :
            this.translateService.instant('workspace.save-unit-data-changes-warning')
        })),
        tap(({ isWarning: warning, content: message }) => {
          isWarning = warning;
          content = message;
        })
      ).subscribe();
      const dialogRef = this.confirmDialog.open(SaveOrDiscardComponent, {
        width: '500px',
        data: <ConfirmDialogData> {
          title: this.translateService.instant('workspace.save'),
          content: content,
          confirmButtonLabel: this.translateService.instant('workspace.save'),
          confirmButtonReturn: 'YES',
          confirmButton2Label: this.translateService.instant('workspace.reject-changes-label'),
          confirmButton2Return: 'NO',
          warning: isWarning
        }
      });
      return dialogRef.afterClosed().pipe(
        switchMap(result => {
          console.log('Dialogergebnis:', result);

          switch (result) {
            case false:
              return of(false);

            case 'NO':
              return of(true);

            case 'YES':
              return from(this.workspaceService.saveUnitData()).pipe(
                map(saveResult => {
                  const message = saveResult ?
                    'Änderungen an Aufgabedaten gespeichert' :
                    'Problem: Konnte Aufgabendaten nicht speichern';
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

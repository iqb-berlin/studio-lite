import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { SaveOrDiscardComponent } from '../components/save-or-discard/save-or-discard.component';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceComponent } from '../workspace.component';
import { ConfirmDialogData } from '../models/confirm-dialog.data';

@Injectable()
export class UnitRoutingCanDeactivateGuard implements CanDeactivate<WorkspaceComponent> {
  constructor(
    public confirmDialog: MatDialog,
    private snackBar: MatSnackBar,
    public workspaceService: WorkspaceService,
    private translateService: TranslateService
  ) { }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.workspaceService.isChanged()) {
      const dialogRef = this.confirmDialog.open(SaveOrDiscardComponent, {
        width: '500px',
        data: <ConfirmDialogData> {
          title: this.translateService.instant('workspace.save'),
          content: this.translateService.instant('workspace.save-unit-data-changes'),
          confirmButtonLabel: this.translateService.instant('workspace.save'),
          confirmButtonReturn: 'YES',
          confirmButton2Label: this.translateService.instant('workspace.reject-changes-label'),
          confirmButton2Return: 'NO'
        }
      });
      return dialogRef.afterClosed().pipe(
        switchMap(result => {
          if (result === false) {
            return of(false);
          }
          if (result === 'NO') {
            return of(true);
          } // 'YES':
          return this.workspaceService.saveUnitData()
            .then(saveResult => {
              if (saveResult) {
                this.snackBar.open('Änderungen an Aufgabedaten gespeichert', '', { duration: 1000 });
                return true;
              }
              this.snackBar.open('Problem: Konnte Aufgabendaten nicht speichern', '', { duration: 1000 });
              return false;
            });
        })
      );
    }
    return of(true);
  }
}

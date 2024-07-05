import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
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
    if (this.workspaceService.isChanged() && this.workspaceService.userAccessLevel > 0) {
      let content = '';
      let isWarning = true;
      this.workspaceService.isValidFormKey.subscribe(isValid => {
        isWarning = !isValid;
        if (isValid) {
          content = this.translateService.instant('workspace.save-unit-data-changes');
        } else {
          content = this.translateService.instant('workspace.save-unit-data-changes-warning');
        }
      });
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

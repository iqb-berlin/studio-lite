import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { map, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnitComponent } from './unit.component';
import { ConfirmDialogData, SaveOrDiscardComponent } from '../dialogs/save-or-discard.component';
import { DatastoreService } from '../datastore.service';

@Injectable()
export class UnitRoutingCanDeactivateGuard implements CanDeactivate<UnitComponent> {
  constructor(
    public confirmDialog: MatDialog,
    private snackBar: MatSnackBar,
    public ds: DatastoreService
  ) { }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.ds.unitMetadataChanged || this.ds.unitDefinitionChanged) {
      const dialogRef = this.confirmDialog.open(SaveOrDiscardComponent, {
        width: '500px',
        height: '300px',
        data: <ConfirmDialogData> {
          title: 'Speichern',
          content: 'Sie haben Daten dieser Aufgabe geändert. Möchten Sie diese Änderungen speichern?',
          confirmButtonLabel: 'Speichern',
          confirmButtonReturn: 'YES',
          confirmButton2Label: 'Änderungen verwerfen',
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
          return this.ds.saveUnitData().pipe(
            map(saveResult => {
              if (saveResult === true) {
                this.snackBar.open('Änderungen an Aufgabedaten gespeichert', '', { duration: 1000 });
                return true;
              }
              this.snackBar.open('Problem: Konnte Aufgabendaten nicht speichern', '', { duration: 1000 });
              return false;
            })
          );
        })
      );
    }
    return of(true);
  }
}

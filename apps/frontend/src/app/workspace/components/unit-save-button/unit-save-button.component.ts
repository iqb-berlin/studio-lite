import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { WorkspaceService } from '../../workspace.service';

@Component({
  selector: 'studio-lite-unit-save-button',
  templateUrl: './unit-save-button.component.html',
  styleUrls: ['./unit-save-button.component.scss']
})
export class UnitSaveButtonComponent {
  constructor(
    public workspaceService: WorkspaceService,
    private deleteConfirmDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  discardChanges(): void {
    const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Verwerfen der Änderungen',
        content: 'Die Änderungen an der Aufgabe werden verworfen. Fortsetzen?',
        confirmButtonLabel: 'Verwerfen',
        showCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        if (this.workspaceService.unitMetadataStore) this.workspaceService.unitMetadataStore.restore();
        if (this.workspaceService.unitDefinitionStore) this.workspaceService.unitDefinitionStore.restore();
        if (this.workspaceService.unitSchemeStore) this.workspaceService.unitSchemeStore.restore();
        const unitId = this.workspaceService.selectedUnit$.getValue();
        this.workspaceService.selectedUnit$.next(unitId);
      }
    });
  }

  saveUnitData(): void {
    this.workspaceService.saveUnitData().then(saveResult => {
      if (saveResult) {
        this.snackBar.open('Änderungen an Aufgabedaten gespeichert', '', { duration: 1000 });
      } else {
        this.snackBar.open('Problem: Konnte Aufgabendaten nicht speichern', '', { duration: 3000 });
      }
    });
  }
}

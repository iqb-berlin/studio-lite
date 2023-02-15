import { Component } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectUnitComponent, SelectUnitData } from '../../dialogs/select-unit.component';
import { WorkspaceService } from '../../workspace.service';
import { BackendService } from '../../backend.service';
import { AppService } from '../../../app.service';
import { SelectUnitDirective } from '../../directives/select-unit.directive';

@Component({
  selector: 'studio-lite-delete-unit-button',
  templateUrl: './delete-unit-button.component.html',
  styleUrls: ['./delete-unit-button.component.scss']
})
export class DeleteUnitButtonComponent extends SelectUnitDirective {
  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    private appService: AppService,
    public backendService: BackendService,
    private snackBar: MatSnackBar,
    private selectUnitDialog: MatDialog
  ) {
    super();
  }

  deleteUnit(): void {
    this.deleteUnitDialog().then((unitsToDelete: number[] | boolean) => {
      if (typeof unitsToDelete !== 'boolean') {
        this.backendService.deleteUnits(
          this.workspaceService.selectedWorkspaceId,
          unitsToDelete
        ).subscribe(
          ok => {
            // todo db-error?
            if (ok) {
              this.snackBar.open('Aufgabe(n) gelöscht', '', { duration: 1000 });
              this.updateUnitList();
            } else {
              this.snackBar.open('Konnte Aufgabe(n) nicht löschen.', 'Fehler', { duration: 3000 });
              this.appService.dataLoading = false;
            }
          }
        );
      }
    });
  }

  private async deleteUnitDialog(): Promise<number[] | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.selectUnitDialog.open(SelectUnitComponent, {
        width: '500px',
        height: '700px',
        data: <SelectUnitData>{
          title: 'Aufgabe(n) löschen',
          buttonLabel: 'Löschen',
          fromOtherWorkspacesToo: false,
          multiple: true
        }
      });
      return lastValueFrom(dialogRef.afterClosed()
        .pipe(
          map(dialogResult => {
            if (typeof dialogResult !== 'undefined') {
              const dialogComponent = dialogRef.componentInstance;
              if (dialogResult !== false && dialogComponent.selectedUnitIds.length > 0) {
                return dialogComponent.selectedUnitIds;
              }
            }
            return false;
          })
        ));
    }
    return false;
  }
}

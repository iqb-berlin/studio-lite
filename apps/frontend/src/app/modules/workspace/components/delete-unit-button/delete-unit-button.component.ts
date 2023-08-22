import { Component, Input } from '@angular/core';
import { lastValueFrom, map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SelectUnitComponent, SelectUnitData } from '../select-unit/select-unit.component';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { SelectUnitDirective } from '../../directives/select-unit.directive';

@Component({
  selector: 'studio-lite-delete-unit-button',
  templateUrl: './delete-unit-button.component.html',
  styleUrls: ['./delete-unit-button.component.scss']
})
export class DeleteUnitButtonComponent extends SelectUnitDirective {
  @Input() selectedUnitId!: number;
  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    private appService: AppService,
    public backendService: BackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
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
              this.snackBar.open(
                this.translateService.instant('workspace.unit-deleted'),
                '',
                { duration: 1000 }
              );
              this.updateUnitList();
            } else {
              this.snackBar.open(
                this.translateService.instant('workspace.unit-not-deleted'),
                this.translateService.instant('workspace.error'),
                { duration: 3000 }
              );
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
          title: this.translateService.instant('workspace.delete-units'),
          buttonLabel: this.translateService.instant('workspace.delete'),
          fromOtherWorkspacesToo: false,
          multiple: true,
          selectedUnitId: this.selectedUnitId
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

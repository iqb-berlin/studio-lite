import { Component, Input, OnDestroy } from '@angular/core';
import {
  lastValueFrom, map, Subject, takeUntil
} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { SelectUnitComponent, SelectUnitData } from '../select-unit/select-unit.component';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { DeleteDialogComponent } from '../../../shared/components/delete-dialog/delete-dialog.component';

@Component({
  selector: 'studio-lite-delete-unit-button',
  templateUrl: './delete-unit-button.component.html',
  styleUrls: ['./delete-unit-button.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class DeleteUnitButtonComponent extends SelectUnitDirective implements OnDestroy {
  @Input() selectedUnitId!: number;
  @Input() disabled!: boolean;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    private appService: AppService,
    public backendService: WorkspaceBackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    super();
  }

  deleteUnit(): void {
    this.deleteUnitDialog()
      .then((unitsToDelete: number[] | boolean) => {
        if (typeof unitsToDelete !== 'boolean') {
          const titleKey = unitsToDelete.length === 1 ?
            'workspace.delete-one-unit' : 'workspace.delete-many-units';
          const contentKey = unitsToDelete.length === 1 ?
            'workspace.delete-one-unit-confirmation' : 'workspace.delete-many-units-confirmation';
          this.dialog.open(DeleteDialogComponent, {
            width: '400px',
            data: {
              title: this.translateService
                .instant(titleKey, { count: unitsToDelete.length }),
              content: this.translateService
                .instant(contentKey, { count: unitsToDelete.length })
            }
          })
            .afterClosed()
            .subscribe(confirmed => {
              if (!confirmed) return;
              this.backendService.deleteUnits(
                this.workspaceService.selectedWorkspaceId,
                unitsToDelete
              ).pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(
                  ok => {
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
            });
        }
      });
  }

  private async deleteUnitDialog(): Promise<number[] | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.dialog.open(SelectUnitComponent, {
        width: '800px',
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

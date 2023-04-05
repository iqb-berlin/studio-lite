import { Component } from '@angular/core';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { format } from 'date-fns';
import { saveAs } from 'file-saver-es';
import { MessageDialogComponent, MessageDialogData, MessageType } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, map } from 'rxjs';
import { WorkspaceService } from '../../services/workspace.service';
import { GroupManageComponent } from '../../dialogs/group-manage.component';
import { ReviewsComponent } from '../../dialogs/reviews/reviews.component';
import { WorkspaceUserListComponent } from '../../dialogs/workspace-user-list.component';
import { ExportUnitComponent } from '../../dialogs/export-unit/export-unit.component';
import { MoveUnitComponent, MoveUnitData } from '../../dialogs/move-unit.component';
import { RequestMessageDialogComponent } from '../../../dialogs/request-message-dialog.component';
import {
  EditWorkspaceSettingsComponent
} from '../../../dialogs/edit-workspace-settings/edit-workspace-settings.component';
import { BackendService as AppBackendService } from '../../../services/backend.service';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../services/app.service';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { SelectUnitComponent, SelectUnitData } from '../../dialogs/select-unit.component';

@Component({
  selector: 'studio-lite-edit-unit-button',
  templateUrl: './edit-unit-button.component.html',
  styleUrls: ['./edit-unit-button.component.scss']
})
export class EditUnitButtonComponent extends SelectUnitDirective {
  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    private editSettingsDialog: MatDialog,
    private appBackendService: AppBackendService,
    private snackBar: MatSnackBar,
    private selectUnitDialog: MatDialog,
    public backendService: BackendService,
    private uploadReportDialog: MatDialog,
    private appService: AppService,
    private translate: TranslateService,
    private messsageDialog: MatDialog,
    private showUsersDialog: MatDialog,
    private groupDialog: MatDialog,
    private translateService: TranslateService,
    private reviewsDialog: MatDialog
  ) {
    super();
  }

  settings(): void {
    const dialogRef = this.editSettingsDialog.open(EditWorkspaceSettingsComponent, {
      width: '500px',
      data: this.workspaceService.workspaceSettings
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workspaceService.workspaceSettings.defaultEditor = result.defaultEditor;
        this.workspaceService.workspaceSettings.defaultPlayer = result.defaultPlayer;
        this.workspaceService.workspaceSettings.defaultSchemer = result.defaultSchemer;
        this.workspaceService.workspaceSettings.stableModulesOnly = result.stableModulesOnly;
        this.appBackendService.setWorkspaceSettings(
          this.workspaceService.selectedWorkspaceId, this.workspaceService.workspaceSettings
        ).subscribe(isOK => {
          if (isOK) {
            this.snackBar.open(
              this.translate.instant('workspace.settings-saved'),
              '',
              { duration: 1000 }
            );
          } else {
            this.snackBar.open(
              this.translate.instant('workspace.settings-not-saved'),
              this.translate.instant('workspace.error'),
              { duration: 3000 }
            );
          }
        });
      }
    });
  }

  moveOrCopyUnit(moveOnly: boolean): void {
    const dialogRef = this.selectUnitDialog.open(MoveUnitComponent, {
      width: '500px',
      height: '700px',
      data: <MoveUnitData> {
        title: moveOnly ?
          this.translate.instant('workspace.move-units') :
          this.translate.instant('workspace.copy-units'),
        buttonLabel: moveOnly ?
          this.translate.instant('workspace.move') :
          this.translate.instant('workspace.copy'),
        currentWorkspaceId: this.workspaceService.selectedWorkspaceId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          const dialogComponent = dialogRef.componentInstance;
          if (dialogComponent.targetWorkspace > 0) {
            this.backendService.moveOrCopyUnits(
              this.workspaceService.selectedWorkspaceId,
              dialogComponent.selectedUnits,
              dialogComponent.targetWorkspace,
              moveOnly
            ).subscribe(uploadStatus => {
              if (typeof uploadStatus === 'boolean') {
                this.snackBar.open(
                  this.translate
                    .instant('workspace.unit-not-moved-or-copied',
                      { action: moveOnly ? 'verschieben' : 'kopieren' }),
                  this.translate.instant('workspace.error'),
                  { duration: 3000 }
                );
              } else if (uploadStatus.messages && uploadStatus.messages.length > 0) {
                const dialogRef2 = this.uploadReportDialog.open(RequestMessageDialogComponent, {
                  width: '500px',
                  height: '600px',
                  data: uploadStatus
                });
                dialogRef2.afterClosed().subscribe(() => {
                  this.updateUnitList();
                });
              } else {
                this.snackBar.open(
                  this.translate
                    .instant('workspace.unit-moved-or-copied',
                      { action: moveOnly ? 'verschoben' : 'kopiert' }),
                  '',
                  { duration: 5000 }
                );
                this.updateUnitList();
              }
            });
          }
        }
      }
    });
  }

  exportUnit(): void {
    if (Object.keys(this.workspaceService.unitList).length > 0) {
      const dialogRef = this.selectUnitDialog.open(ExportUnitComponent, {
        width: '1000px'
      });

      dialogRef.afterClosed().subscribe((result: UnitDownloadSettingsDto | boolean) => {
        if (result !== false) {
          this.appService.dataLoading = true;
          this.backendService.downloadUnits(
            this.workspaceService.selectedWorkspaceId,
            result as UnitDownloadSettingsDto
          ).subscribe(b => {
            if (b) {
              if (typeof b === 'number') {
                this.appService.dataLoading = b;
              } else {
                const thisMoment = format(new Date(), 'yyyy-MM-dd');
                saveAs(b, `${thisMoment} studio unit download.zip`);
                this.appService.dataLoading = false;
              }
            }
          });
        }
      });
    } else {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: this.translate.instant('unit-download.dialog.title'),
          content: this.translate.instant('workspace.no-units'),
          type: MessageType.error
        }
      });
    }
  }

  printUnits(): void {
    this.printUnitDialog()
      .then((unitsToPrint: number[] | boolean) => {
        if (Array.isArray(unitsToPrint) && unitsToPrint.length) {
          const url = this.router
            .serializeUrl(this.router
              .createUrlTree(['/print'], {
                queryParams: {
                  unitIds: unitsToPrint,
                  workspaceId: this.workspaceService.selectedWorkspaceId
                }
              }));
          window.open(`#${url}`, '_blank');
        }
      });
  }

  private async printUnitDialog(): Promise<number[] | boolean> {
    const dialogRef = this.selectUnitDialog.open(SelectUnitComponent, {
      width: '500px',
      height: '700px',
      data: <SelectUnitData>{
        title: this.translate.instant('workspace.print-units'),
        buttonLabel: this.translate.instant('workspace.print'),
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

  userList(): void {
    this.backendService.getUsersList(this.workspaceService.selectedWorkspaceId).subscribe(dataResponse => {
      if (dataResponse !== false) {
        this.showUsersDialog.open(WorkspaceUserListComponent, {
          width: '800px',
          data: {
            title: this.translate
              .instant('workspace.user-list',
                { workspace: this.workspaceService.selectedWorkspaceName }),
            users: dataResponse
          }
        });
      }
    });
  }

  reviews(): void {
    this.reviewsDialog.open(ReviewsComponent, {
      width: '1200px'
    });
  }

  async manageGroups() {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      this.groupDialog.open(GroupManageComponent, {
        width: '1000px',
        height: '800px'
      }).afterClosed().subscribe(() => {
        this.updateUnitList();
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { RequestReportDto, UnitDownloadSettingsDto, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { format } from 'date-fns';
import { saveAs } from 'file-saver-es';
import { MessageDialogComponent, MessageDialogData, MessageType } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { lastValueFrom, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { WorkspaceService } from '../../services/workspace.service';
import { GroupManageComponent } from '../group-manage/group-manage.component';
import { ReviewsComponent } from '../reviews/reviews.component';
import { WorkspaceUserListComponent } from '../workspace-user-list/workspace-user-list.component';
import { ExportUnitComponent } from '../export-unit/export-unit.component';
import { MoveUnitComponent } from '../move-unit/move-unit.component';
import {
  RequestMessageComponent
} from '../../../../components/request-message/request-message.component';
import {
  EditWorkspaceSettingsComponent
} from '../../../shared/components/edit-workspace-settings/edit-workspace-settings.component';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { MoveUnitData } from '../../models/move-unit-data.interface';
import { ShowMetadataComponent } from '../show-metadata/show-metadata.component';
import { TableViewComponent } from '../../../metadata/components/table-view/table-view.component';
import { MetadataService } from '../../../metadata/services/metadata.service';
import { PrintUnitsDialogComponent } from '../print-units-dialog/print-units-dialog.component';
import { CodingReportComponent } from '../coding-report/coding-report.component';
import { ExportCodingBookComponent } from '../export-coding-book/export-coding-book.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { RequestMessageDirective } from '../../directives/request-message.directive';
import { SelectUnitComponent, SelectUnitData } from '../select-unit/select-unit.component';

@Component({
  selector: 'studio-lite-edit-unit-button',
  templateUrl: './edit-unit-button.component.html',
  styleUrls: ['./edit-unit-button.component.scss'],
  imports: [MatButton, MatMenuTrigger, MatTooltip, WrappedIconComponent, MatMenu, MatMenuItem, MatIcon, MatDivider,
    TranslateModule]
})
export class EditUnitButtonComponent extends RequestMessageDirective implements OnInit {
  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    public snackBar: MatSnackBar,
    public selectUnitDialog: MatDialog,
    public backendService: BackendService,
    public uploadReportDialog: MatDialog,
    public translateService: TranslateService,
    private appService: AppService,
    private editSettingsDialog: MatDialog,
    private appBackendService: AppBackendService,
    private messageDialog: MatDialog,
    private showUsersDialog: MatDialog,
    private groupDialog: MatDialog,
    private reviewsDialog: MatDialog,
    private showMetadataDialog: MatDialog,
    private metadataService: MetadataService,
    private codingReportDialog: MatDialog
  ) {
    super();
  }

  userListTitle: string = '';

  ngOnInit(): void {
    this.userListTitle = this.workspaceService.selectedWorkspaceName ?
      this.translateService
        .instant('workspace.user-list', { workspace: this.workspaceService.selectedWorkspaceName }) :
      this.translateService
        .instant('workspace.user-list-no-selection');
  }

  settings(): void {
    const dialogRef = this.editSettingsDialog.open(EditWorkspaceSettingsComponent, {
      width: '700px',
      data: {
        settings: this.workspaceService.workspaceSettings,
        selectedRow: { id: this.workspaceService.selectedWorkspaceId }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workspaceService.workspaceSettings.defaultEditor = result.defaultEditor;
        this.workspaceService.workspaceSettings.defaultPlayer = result.defaultPlayer;
        this.workspaceService.workspaceSettings.defaultSchemer = result.defaultSchemer;
        this.workspaceService.workspaceSettings.stableModulesOnly = result.stableModulesOnly;
        this.workspaceService.workspaceSettings.unitMDProfile = result.unitMDProfile;
        this.workspaceService.workspaceSettings.itemMDProfile = result.itemMDProfile;
        this.workspaceService.workspaceSettings.states = result.states;

        this.appBackendService.setWorkspaceSettings(
          this.workspaceService.selectedWorkspaceId, this.workspaceService.workspaceSettings
        ).subscribe(isOK => {
          if (isOK) {
            this.snackBar.open(
              this.translateService.instant('workspace.settings-saved'),
              '',
              { duration: 1000 }
            );
          } else {
            this.snackBar.open(
              this.translateService.instant('workspace.settings-not-saved'),
              this.translateService.instant('workspace.error'),
              { duration: 3000 }
            );
          }
        });
      }
    });
  }

  async moveOrCopyUnit(moveOnly: boolean): Promise<void> {
    const routingOk = moveOnly ? await this.selectUnit(0) : true;
    if (routingOk) {
      const dialogRef = this.selectUnitDialog.open(MoveUnitComponent, {
        width: '800px',
        height: '700px',
        data: <MoveUnitData>{
          title: moveOnly ?
            this.translateService.instant('workspace.move-units') :
            this.translateService.instant('workspace.copy-units'),
          subtitle: moveOnly ? this.translateService.instant('workspace.unit-dropbox-history-deleted') : '',
          commentsOption: !moveOnly,
          buttonLabel: moveOnly ?
            this.translateService.instant('workspace.move') :
            this.translateService.instant('workspace.copy'),
          currentWorkspaceId: this.workspaceService.selectedWorkspaceId
        }
      });

      dialogRef.afterClosed()
        .subscribe(result => {
          if (typeof result !== 'undefined') {
            if (result !== false) {
              const dialogComponent = dialogRef.componentInstance;
              if (dialogComponent.targetWorkspace > 0) {
                if (moveOnly) {
                  this.backendService.moveUnits(
                    this.workspaceService.selectedWorkspaceId,
                    dialogComponent.selectedUnits,
                    dialogComponent.targetWorkspace
                  ).subscribe(uploadStatus => {
                    this.moveOrCopyUnitSubscription(uploadStatus, moveOnly);
                  });
                } else {
                  this.backendService.copyUnits(
                    dialogComponent.targetWorkspace,
                    dialogComponent.selectedUnits,
                    dialogComponent.copyComments
                  ).subscribe(uploadStatus => {
                    this.moveOrCopyUnitSubscription(uploadStatus, moveOnly);
                  });
                }
              }
            }
          }
        });
    }
  }

  moveOrCopyUnitSubscription(uploadStatus: boolean | RequestReportDto, moveOnly: boolean): void {
    if (typeof uploadStatus === 'boolean') {
      this.snackBar.open(
        this.translateService
          .instant('workspace.unit-not-moved-or-copied',
            { action: moveOnly ? 'verschieben' : 'kopieren' }),
        this.translateService.instant('workspace.error'),
        { duration: 3000 }
      );
    } else if (uploadStatus.messages && uploadStatus.messages.length > 0) {
      const dialogRef2 = this.uploadReportDialog.open(RequestMessageComponent, {
        width: '500px',
        data: uploadStatus
      });
      dialogRef2.afterClosed()
        .subscribe(() => {
          this.updateUnitList();
        });
    } else {
      this.snackBar.open(
        this.translateService
          .instant('workspace.unit-moved-or-copied',
            { action: moveOnly ? 'verschoben' : 'kopiert' }),
        '',
        { duration: 5000 }
      );
      this.updateUnitList();
    }
  }

  exportUnit(): void {
    if (Object.keys(this.workspaceService.unitList).length > 0) {
      const dialogRef = this.selectUnitDialog.open(ExportUnitComponent, {
        width: '1000px',
        data: {

        }
      });
      dialogRef.afterClosed().subscribe((result: UnitDownloadSettingsDto | boolean) => {
        if (result) {
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
      this.messageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: this.translateService.instant('unit-download.dialog.title'),
          content: this.translateService.instant('workspace.no-units'),
          type: MessageType.error
        }
      });
    }
  }

  printUnits(): void {
    if (Object.keys(this.workspaceService.unitList).length > 0) {
      const dialogRef = this.selectUnitDialog.open(PrintUnitsDialogComponent, {
        width: '1000px'
      });

      dialogRef.afterClosed()
        .subscribe(result => {
          if (result) {
            const url = this.router
              .serializeUrl(this.router
                .createUrlTree(['/print'], {
                  queryParams: {
                    printPreviewHeight: result.printPreviewHeight,
                    printOptions: result.printOptions,
                    unitIds: result.unitIds,
                    workspaceId: this.workspaceService.selectedWorkspaceId,
                    workspaceGroupId: this.workspaceService.groupId
                  }
                }));
            window.open(`#${url}`, '_blank');
          }
        });
    }
  }

  private async submitUnitsDialog(): Promise<number[] | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.selectUnitDialog.open(SelectUnitComponent, {
        width: '800px',
        height: '700px',
        data: <SelectUnitData>{
          title: this.translateService.instant('workspace.submit-units-title'),
          buttonLabel: this.translateService.instant('workspace.submit-units'),
          fromOtherWorkspacesToo: false,
          multiple: true,
          selectedUnitId: this.workspaceService.selectedUnit$.getValue()
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

  private async returnSubmittedUnitsDialog(): Promise<number[] | boolean> {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      const dialogRef = this.selectUnitDialog.open(SelectUnitComponent, {
        width: '800px',
        height: '700px',
        data: <SelectUnitData>{
          title: this.translateService.instant('workspace.return-submitted-units-title'),
          buttonLabel: this.translateService.instant('workspace.return-submitted-units'),
          fromOtherWorkspacesToo: false,
          multiple: true,
          selectedUnitId: this.workspaceService.selectedUnit$.getValue(),
          queryParams: (new HttpParams())
            .append('targetWorkspaceId', this.workspaceService.selectedWorkspaceId.toString())
            .append('filterTargetWorkspaceId', true)
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

  async returnSubmittedUnits(): Promise<void> {
    this.returnSubmittedUnitsDialog().then((units: number[] | boolean) => {
      if (typeof units !== 'boolean' && units.length && this.workspaceService.hasDroppedUnits) {
        this.backendService.returnSubmittedUnits(
          this.workspaceService.selectedWorkspaceId,
          units
        ).subscribe(
          uploadStatus => {
            this.showRequestMessage(uploadStatus, 'workspace.units-not-returned', 'workspace.units-returned');
          });
      }
    });
  }

  async submitUnits(): Promise<void> {
    this.submitUnitsDialog().then((units: number[] | boolean) => {
      if (typeof units !== 'boolean' && units.length && this.workspaceService.dropBoxId) {
        this.backendService.submitUnits(
          this.workspaceService.selectedWorkspaceId,
          this.workspaceService.dropBoxId,
          units
        ).subscribe(
          uploadStatus => {
            this.showRequestMessage(uploadStatus, 'workspace.units-not-submitted', 'workspace.units-submitted');
          });
      }
    });
  }

  showMetadata(): void {
    if (Object.keys(this.workspaceService.unitList).length > 0) {
      this.selectUnitDialog.open(ShowMetadataComponent, {
        width: '800px',
        data: { warning: '' }
      }).afterClosed().subscribe(res => {
        this.metadataService.createMetadataReport()
          .subscribe((units: UnitPropertiesDto[] | boolean) => {
            if (res) {
              const selectedUnits = (units as UnitPropertiesDto[])
                .filter((unit: UnitPropertiesDto) => res.selectedUnits.includes(unit.id));
              this.showMetadataDialog.open(TableViewComponent, {
                width: '80%',
                data: { units: selectedUnits, warning: '' },
                autoFocus: false
              });
            }
          });
      });
    }
  }

  exportCodingBook():void {
    if (Object.keys(this.workspaceService.unitList).length > 0) {
      this.selectUnitDialog.open(ExportCodingBookComponent, {
        width: '900px',
        autoFocus: false
      });
    }
  }

  showCodingReport(): void {
    if (Object.keys(this.workspaceService.unitList).length > 0) {
      this.codingReportDialog.open(CodingReportComponent, {
        width: '80%',
        minHeight: '80%',
        autoFocus: false
      });
    }
  }

  userList(): void {
    this.backendService.getUsersList(this.workspaceService.selectedWorkspaceId).subscribe(dataResponse => {
      if (dataResponse !== false) {
        this.showUsersDialog.open(WorkspaceUserListComponent, {
          width: '800px',
          data: {
            title: this.translateService
              .instant('workspace.user-list', { workspace: this.workspaceService.selectedWorkspaceName }),
            users: dataResponse
          }
        });
      }
    });
  }

  reviews(): void {
    this.reviewsDialog.open(ReviewsComponent, {
      width: '1400px'
    });
  }

  async manageGroups() {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      this.groupDialog.open(GroupManageComponent, {
        width: '1400px'
      }).afterClosed().subscribe(() => {
        this.updateUnitList();
      });
    }
  }
}

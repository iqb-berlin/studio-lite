import { Component } from '@angular/core';
import { UnitDownloadSettingsDto, UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { format } from 'date-fns';
import { saveAs } from 'file-saver-es';
import { MessageDialogComponent, MessageDialogData, MessageType } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
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
// eslint-disable-next-line import/no-cycle
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { MoveUnitData } from '../../models/move-unit-data.interface';
import { ShowMetadataComponent } from '../show-metadata/show-metadata.component';
import { TableViewComponent } from '../../../metadata/components/table-view/table-view.component';
import { MetadataService } from '../../../metadata/services/metadata.service';
import { PrintUnitsDialogComponent } from '../print-units-dialog/print-units-dialog.component';
import { CodingReportComponent } from '../coding-report/coding-report.component';
// eslint-disable-next-line import/no-cycle
import { ExportCodingBookComponent } from '../export-coding-book/export-coding-book.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-edit-unit-button',
  templateUrl: './edit-unit-button.component.html',
  styleUrls: ['./edit-unit-button.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatButton, MatMenuTrigger, MatTooltip, WrappedIconComponent, MatMenu, NgIf, MatMenuItem, MatIcon, MatDivider, TranslateModule]
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
      this.translate
        .instant('workspace.user-list', { workspace: this.workspaceService.selectedWorkspaceName }) :
      this.translate
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
      data: <MoveUnitData>{
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
                const dialogRef2 = this.uploadReportDialog.open(RequestMessageComponent, {
                  width: '500px',
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
          title: this.translate.instant('unit-download.dialog.title'),
          content: this.translate.instant('workspace.no-units'),
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

  showMetadata(): void {
    if (Object.keys(this.workspaceService.unitList).length > 0) {
      this.selectUnitDialog.open(ShowMetadataComponent, {
        width: '600px'
      }).afterClosed().subscribe(res => {
        this.metadataService.createMetadataReport().subscribe((units: any) => {
          if (res) {
            const selectedUnits = units.filter((unit: UnitMetadataDto) => res.selectedUnits.includes(unit.id));
            this.showMetadataDialog.open(TableViewComponent, {
              width: '80%',
              height: '80%',
              data: { units: selectedUnits },
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
        width: '800px',
        minHeight: '50%',
        autoFocus: false
      });
    }
  }

  showCodingReport(): void {
    if (Object.keys(this.workspaceService.unitList).length > 0) {
      this.codingReportDialog.open(CodingReportComponent, {
        width: '80%',
        minHeight: '50%',
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
            title: this.translate
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

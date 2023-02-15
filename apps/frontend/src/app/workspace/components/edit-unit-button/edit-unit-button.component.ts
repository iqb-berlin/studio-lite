import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { format } from 'date-fns';
import { saveAs } from 'file-saver-es';
import { MessageDialogComponent, MessageDialogData, MessageType } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from '../../workspace.service';
import { GroupManageComponent } from '../../dialogs/group-manage.component';
import { ReviewsComponent } from '../../dialogs/reviews.component';
import { WorkspaceUserListComponent } from '../../dialogs/workspace-user-list.component';
import { ExportUnitComponent } from '../../dialogs/export-unit.component';
import { MoveUnitComponent, MoveUnitData } from '../../dialogs/move-unit.component';
import { RequestMessageDialogComponent } from '../../../components/request-message-dialog.component';
import { EditWorkspaceSettingsComponent } from '../../../components/edit-workspace-settings.component';
import { BackendService as AppBackendService } from '../../../backend.service';
import { BackendService } from '../../backend.service';
import { AppService } from '../../../app.service';

@Component({
  selector: 'studio-lite-edit-button-unit',
  templateUrl: './edit-unit-button.component.html',
  styleUrls: ['./edit-unit-button.component.scss']
})
export class EditUnitButtonComponent {
  @Input() selectedRouterLink!: number;
  @Input() navLinks!: string[];
  @Output() unitListUpdate: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();

  constructor(
    public workspaceService: WorkspaceService,
    private editSettingsDialog: MatDialog,
    private appBackendService: AppBackendService,
    private snackBar: MatSnackBar,
    private selectUnitDialog: MatDialog,
    private backendService: BackendService,
    private uploadReportDialog: MatDialog,
    private appService: AppService,
    private translate: TranslateService,
    private messsageDialog: MatDialog,
    private showUsersDialog: MatDialog,
    private groupDialog: MatDialog,
    private reviewsDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  settings(): void {
    const dialogRef = this.editSettingsDialog.open(EditWorkspaceSettingsComponent, {
      width: '500px',
      data: this.workspaceService.workspaceSettings
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.workspaceService.workspaceSettings.defaultEditor = result.defaultEditor;
        this.workspaceService.workspaceSettings.defaultPlayer = result.defaultPlayer;
        this.workspaceService.workspaceSettings.defaultSchemer = result.defaultSchemer;
        this.workspaceService.workspaceSettings.stableModulesOnly = result.stableModulesOnly;
        this.appBackendService.setWorkspaceSettings(
          this.workspaceService.selectedWorkspaceId, this.workspaceService.workspaceSettings
        ).subscribe(isOK => {
          if (!isOK) {
            this.snackBar.open('Einstellungen konnten nicht gespeichert werden.', '', { duration: 3000 });
          } else {
            this.snackBar.open('Einstellungen gespeichert', '', { duration: 1000 });
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
        title: moveOnly ? 'Aufgabe(n) verschieben' : 'Aufgabe(n) kopieren',
        buttonLabel: moveOnly ? 'Verschieben' : 'Kopieren',
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
                this.snackBar.open(`Konnte Aufgabe(n) nicht ${moveOnly ? 'verschieben' : 'kopieren'}.`,
                  'Fehler',
                  { duration: 3000 });
              } else if (uploadStatus.messages && uploadStatus.messages.length > 0) {
                const dialogRef2 = this.uploadReportDialog.open(RequestMessageDialogComponent, {
                  width: '500px',
                  height: '600px',
                  data: uploadStatus
                });
                dialogRef2.afterClosed().subscribe(() => {
                  // this.updateUnitList();
                  this.unitListUpdate.emit();
                });
              } else {
                this.snackBar.open(
                  `Aufgabe(n) ${moveOnly ? 'verschoben' : 'kopiert'}`, '', { duration: 1000 }
                );
                this.unitListUpdate.emit();
                // this.updateUnitList();
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
        width: '900px'
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
          content: 'Dieser Arbeitsbereich enthält keine Units!',
          type: MessageType.error
        }
      });
    }
  }

  userList(): void {
    this.backendService.getUsersList(this.workspaceService.selectedWorkspaceId).subscribe(dataResponse => {
      if (dataResponse !== false) {
        this.showUsersDialog.open(WorkspaceUserListComponent, {
          width: '800px',
          data: {
            title: `Liste der Nutzer:innen für "${this.workspaceService.selectedWorkspaceName}"`,
            users: dataResponse
          }
        });
      }
    });
  }

  reviews(): void {
    this.reviewsDialog.open(ReviewsComponent, {
      width: '1000px',
      height: '820px'
    });
  }

  async manageGroups() {
    const routingOk = await this.selectUnit(0);
    if (routingOk) {
      this.groupDialog.open(GroupManageComponent, {
        width: '1000px',
        height: '800px'
      }).afterClosed().subscribe(() => {
        // this.updateUnitList();
        this.unitListUpdate.emit();
      });
    }
  }

  async selectUnit(unitId?: number): Promise<boolean> {
    if (unitId && unitId > 0) {
      const selectedTab = this.selectedRouterLink;
      const routeSuffix = selectedTab >= 0 ? `/${this.navLinks[selectedTab]}` : '';
      return this.router.navigate([`${unitId}${routeSuffix}`], { relativeTo: this.route.parent });
    }
    return this.router.navigate(
      [`a/${this.workspaceService.selectedWorkspaceId}`],
      { relativeTo: this.route.root }
    );
  }
}

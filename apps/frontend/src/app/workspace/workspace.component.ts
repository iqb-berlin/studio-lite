import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { format } from 'date-fns';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, takeUntil, Subject } from 'rxjs';
import { MessageDialogComponent, MessageDialogData, MessageType } from '@studio-lite-lib/iqb-components';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver-es';
import { HttpParams } from '@angular/common/http';
import { ModuleService } from '@studio-lite/studio-components';
import { AppService } from '../app.service';
import { BackendService } from './backend.service';
import { BackendService as AppBackendService } from '../backend.service';
import { WorkspaceService } from './workspace.service';
import { RequestMessageDialogComponent } from '../components/request-message-dialog.component';
import { ExportUnitComponent } from './dialogs/export-unit.component';
import { MoveUnitComponent, MoveUnitData } from './dialogs/move-unit.component';
import { EditWorkspaceSettingsComponent } from '../components/edit-workspace-settings.component';
import { WorkspaceUserListComponent } from './dialogs/workspace-user-list.component';
import { ReviewsComponent } from './dialogs/reviews.component';
import { GroupManageComponent } from './dialogs/group-manage.component';

@Component({
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  private routingSubscription: Subscription | null = null;
  private ngUnsubscribe = new Subject<void>();
  uploadProcessId = '';
  navLinks = ['metadata', 'editor', 'preview', 'schemer', 'comments'];
  selectedRouterLink = -1;

  constructor(
    public appService: AppService,
    public workspaceService: WorkspaceService,
    private backendService: BackendService,
    private appBackendService: AppBackendService,
    private selectUnitDialog: MatDialog,
    private messsageDialog: MatDialog,
    private editSettingsDialog: MatDialog,
    private showUsersDialog: MatDialog,
    private moduleService: ModuleService,
    private uploadReportDialog: MatDialog,
    private reviewsDialog: MatDialog,
    private groupDialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
    this.uploadProcessId = Math.floor(Math.random() * 20000000 + 10000000).toString();
    this.workspaceService.workspaceSettings = {
      defaultEditor: '',
      defaultPlayer: '',
      defaultSchemer: '',
      unitGroups: [],
      stableModulesOnly: true
    };
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.workspaceService.resetUnitList([]);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      this.workspaceService.selectedWorkspaceId = Number(this.route.snapshot.params['ws']);
      this.routingSubscription = this.route.params.subscribe(params => {
        this.workspaceService.resetUnitData();
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const unitParam = params['u'];
        let unitParamNum = unitParam ? Number(unitParam) : 0;
        if (Number.isNaN(unitParamNum)) unitParamNum = 0;
        this.workspaceService.selectedUnit$.next(unitParamNum);
      });

      this.appBackendService.getWorkspaceData(this.workspaceService.selectedWorkspaceId).subscribe(
        wResponse => {
          if (wResponse) {
            this.workspaceService.selectedWorkspaceName = `${wResponse.groupName}: ${wResponse.name}`;
            this.appService.appConfig.setPageTitle(this.workspaceService.selectedWorkspaceName);
            if (wResponse.settings) {
              this.workspaceService.workspaceSettings = wResponse.settings;
            }
            this.workspaceService.isWorkspaceGroupAdmin =
              this.appService.isWorkspaceGroupAdmin(this.workspaceService.selectedWorkspaceId);
            this.updateUnitList();
            this.moduleService.loadList();
          } else {
            this.snackBar.open(
              'Konnte Daten für Arbeitsbereich nicht laden', 'Fehler', { duration: 3000 }
            );
          }
        }
      );
      this.workspaceService.onCommentsUpdated
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => this.updateUnitList());
    });
  }

  updateUnitList(unitToSelect?: number): void {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('withLastSeenCommentTimeStamp', true);
    this.backendService.getUnitGroups(this.workspaceService.selectedWorkspaceId).subscribe(groups => {
      this.workspaceService.workspaceSettings.unitGroups = groups;
    });
    this.backendService.getUnitList(this.workspaceService.selectedWorkspaceId, queryParams).subscribe(
      uResponse => {
        this.workspaceService.resetUnitList(uResponse);
        if (unitToSelect) this.selectUnit(unitToSelect);
        if (uResponse.length === 0) {
          this.workspaceService.selectedUnit$.next(0);
          this.router.navigate([`/a/${this.workspaceService.selectedWorkspaceId}`]);
        }
      }
    );
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
                  this.updateUnitList();
                });
              } else {
                this.snackBar.open(
                  `Aufgabe(n) ${moveOnly ? 'verschoben' : 'kopiert'}`, '', { duration: 1000 }
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

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  selectRouterLink(selectedRouterLink: number) {
    this.selectedRouterLink = selectedRouterLink;
  }
}

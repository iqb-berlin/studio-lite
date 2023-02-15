import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, takeUntil, Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ModuleService } from '@studio-lite/studio-components';
import { AppService } from '../app.service';
import { BackendService } from './backend.service';
import { BackendService as AppBackendService } from '../backend.service';
import { WorkspaceService } from './workspace.service';

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
    private moduleService: ModuleService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
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

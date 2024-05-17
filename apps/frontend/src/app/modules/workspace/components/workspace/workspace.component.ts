import {
  ActivatedRoute, NavigationEnd, Router
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserWorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { filter, Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitDataAreaComponent } from '../unit-data-area/unit-data-area.component';
import { UnitsAreaComponent } from '../units-area/units-area.component';
import { SplitterPaneComponent } from '../../../splitter/components/splitter-pane/splitter-pane.component';
import { SplitterComponent } from '../../../splitter/components/splitter/splitter.component';
import { RoutingHelperService } from '../../services/routing-helper.service';

@Component({
  selector: 'studio-lite-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  standalone: true,
  imports: [SplitterComponent, SplitterPaneComponent, UnitsAreaComponent, UnitDataAreaComponent]
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  uploadProcessId = '';
  navTabs: { name: string; duplicable: boolean }[] = [
    { name: 'properties', duplicable: false },
    { name: 'editor', duplicable: true },
    { name: 'preview', duplicable: true },
    { name: 'schemer', duplicable: true },
    { name: 'comments', duplicable: true }
  ];

  navLinks = this.navTabs.map(link => link.name);
  selectedRouterLink = -1;
  pinnedNavTab: { name: string, duplicable: boolean }[] = [];
  secondaryRoutingOutlet: string = 'secondary';
  routingOutlet: string = 'primary';
  private ngUnsubscribe = new Subject<void>();

  constructor(
    public appService: AppService,
    public workspaceService: WorkspaceService,
    private route: ActivatedRoute,
    private router: Router,
    private appBackendService: AppBackendService,
    private moduleService: ModuleService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService

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
    this.workspaceService.resetUnitList([]);
    const workspaceKey = 'ws';
    this.workspaceService.selectedWorkspaceId = Number(this.route.snapshot.params[workspaceKey]);
    this.appBackendService.getUserWorkspaceData(
      this.workspaceService.selectedWorkspaceId,
      this.appService.authData.userId
    ).subscribe(
      wResponse => {
        if (wResponse) {
          this.initWorkspace(wResponse);
        } else {
          this.snackBar.open(
            this.translateService.instant('workspace.workspace-not-loaded'),
            this.translateService.instant('error'),
            { duration: 3000 }
          );
        }
      }
    );
    this.router.events
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const url = (event as NavigationEnd).url;
        this.openSecondaryOutlet(url);
      });
    this.openSecondaryOutlet(this.router.routerState.snapshot.url);
  }

  private openSecondaryOutlet(url: string): void {
    const secondaryOutletTab = RoutingHelperService
      .getSecondaryOutlet(url, this.routingOutlet, this.secondaryRoutingOutlet);
    this.pinnedNavTab = secondaryOutletTab ? [{ name: secondaryOutletTab, duplicable: true }] : [];
  }

  private initWorkspace(workspace: UserWorkspaceFullDto): void {
    this.workspaceService.selectedWorkspaceName = `${workspace.groupName}: ${workspace.name}`;
    this.workspaceService.groupId = workspace.groupId || 0;
    this.appService.appConfig.setPageTitle(this.workspaceService.selectedWorkspaceName);
    this.workspaceService.setWorkspaceGroupStates();

    if (workspace.settings) {
      this.workspaceService.workspaceSettings = workspace.settings;
    }
    this.workspaceService.userHasWriteAccess = workspace.userHasWriteAccess;
    this.workspaceService.isWorkspaceGroupAdmin =
      this.appService.isWorkspaceGroupAdmin(this.workspaceService.selectedWorkspaceId);
    this.moduleService.loadList();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

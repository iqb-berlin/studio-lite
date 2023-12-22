import {
  ActivatedRoute, DefaultUrlSerializer, NavigationEnd, Router
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { filter, Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'studio-lite-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
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
    this.appBackendService.getWorkspaceData(this.workspaceService.selectedWorkspaceId).subscribe(
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
    const secondaryOutletTab = WorkspaceComponent
      .getSecondaryOutlet(url, this.routingOutlet, this.secondaryRoutingOutlet);
    this.pinnedNavTab = secondaryOutletTab ? [{ name: secondaryOutletTab, duplicable: true }] : [];
  }

  static getSecondaryOutlet(url: string,
                            primaryRoutingOutlet: string,
                            secondaryRoutingOutlet: string): string | null {
    const serializer = new DefaultUrlSerializer();
    const urlTree = serializer.parse(url);
    return urlTree
      .root.children[primaryRoutingOutlet]?.children[secondaryRoutingOutlet]?.segments[0]?.path || null;
  }

  private initWorkspace(workspace: WorkspaceFullDto): void {
    this.workspaceService.selectedWorkspaceName = `${workspace.groupName}: ${workspace.name}`;
    this.workspaceService.groupId = workspace.groupId;
    this.appService.appConfig.setPageTitle(this.workspaceService.selectedWorkspaceName);
    this.workspaceService.setWorkspaceGroupStates();

    if (workspace.settings) {
      this.workspaceService.workspaceSettings = workspace.settings;
    }
    this.workspaceService.isWorkspaceGroupAdmin =
      this.appService.isWorkspaceGroupAdmin(this.workspaceService.selectedWorkspaceId);
    this.moduleService.loadList();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

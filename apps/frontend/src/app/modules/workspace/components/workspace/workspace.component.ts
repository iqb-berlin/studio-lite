import {
  ActivatedRoute, DefaultUrlSerializer, NavigationEnd, Router
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { WorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { filter } from 'rxjs';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'studio-lite-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent implements OnInit {
  uploadProcessId = '';
  navTabs: { name: string; duplicable: boolean }[] = [
    { name: 'metadata', duplicable: false },
    { name: 'editor', duplicable: false },
    { name: 'preview', duplicable: true },
    { name: 'schemer', duplicable: true },
    { name: 'comments', duplicable: true }
  ];

  navLinks = this.navTabs.map(link => link.name);
  selectedRouterLink = -1;
  pinnedNavTab: { name: string, duplicable: boolean }[] = [];
  secondaryRoutingOutlet = 'secondary';
  routingOutlet = 'primary';

  constructor(
    public appService: AppService,
    public workspaceService: WorkspaceService,
    private route: ActivatedRoute,
    private router: Router,
    private appBackendService: AppBackendService,
    private moduleService: ModuleService,
    private snackBar: MatSnackBar

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
            'Konnte Daten für Arbeitsbereich nicht laden', 'Fehler', { duration: 3000 }
          );
        }
      }
    );
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const url = (event as NavigationEnd).url;
        this.openSecondaryOutlet(url);
      });
    this.openSecondaryOutlet(this.router.routerState.snapshot.url);
  }

  private openSecondaryOutlet(url: string): void {
    const serializer = new DefaultUrlSerializer();
    const urlTree = serializer.parse(url);
    const secondaryOutletTab = urlTree
      .root.children[this.routingOutlet]?.children[this.secondaryRoutingOutlet]?.segments[0]?.path || null;
    this.pinnedNavTab = secondaryOutletTab ? [{ name: secondaryOutletTab, duplicable: true }] : [];
  }

  private initWorkspace(workspace: WorkspaceFullDto): void {
    this.workspaceService.selectedWorkspaceName = `${workspace.groupName}: ${workspace.name}`;
    this.appService.appConfig.setPageTitle(this.workspaceService.selectedWorkspaceName);
    if (workspace.settings) {
      this.workspaceService.workspaceSettings = workspace.settings;
    }
    this.workspaceService.isWorkspaceGroupAdmin =
      this.appService.isWorkspaceGroupAdmin(this.workspaceService.selectedWorkspaceId);
    this.moduleService.loadList();
  }
}

import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { ModuleService } from '@studio-lite/studio-components';
import { AppService } from '../app.service';
import { BackendService } from './backend.service';
import { BackendService as AppBackendService } from '../backend.service';
import { WorkspaceService } from './workspace.service';
import { SelectUnitDirective } from './directives/select-unit.directive';

@Component({
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent extends SelectUnitDirective implements OnInit {
  uploadProcessId = '';
  override navLinks = ['metadata', 'editor', 'preview', 'schemer', 'comments'];
  override selectedRouterLink = -1;

  constructor(
    public appService: AppService,
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    public backendService: BackendService,
    private appBackendService: AppBackendService,
    private moduleService: ModuleService,
    private snackBar: MatSnackBar

  ) {
    super();
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
  }
}

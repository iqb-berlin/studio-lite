import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { ModuleService } from '@studio-lite/studio-components';
import { WorkspaceFullDto } from '@studio-lite-lib/api-dto';
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
  navLinks = ['metadata', 'editor', 'preview', 'schemer', 'comments'];
  selectedRouterLink = -1;

  constructor(
    public appService: AppService,
    public workspaceService: WorkspaceService,
    public route: ActivatedRoute,
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

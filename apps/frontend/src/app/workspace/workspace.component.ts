import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
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
export class WorkspaceComponent extends SelectUnitDirective implements OnInit, OnDestroy {
  private routingSubscription: Subscription | null = null;

  uploadProcessId = '';
  override navLinks = ['metadata', 'editor', 'preview', 'schemer', 'comments'];
  override selectedRouterLink = -1;

  constructor(
    public appService: AppService,
    public workspaceService: WorkspaceService,
    public backendService: BackendService,
    private appBackendService: AppBackendService,
    private moduleService: ModuleService,
    private snackBar: MatSnackBar,
    public router: Router,
    public route: ActivatedRoute
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
    setTimeout(() => {
      this.workspaceService.resetUnitList([]);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const workspaceKey = 'ws';
      this.workspaceService.selectedWorkspaceId = Number(this.route.snapshot.params[workspaceKey]);

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
    });
  }

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
  }

  selectRouterLink(selectedRouterLink: number) {
    this.selectedRouterLink = selectedRouterLink;
  }
}

import {
  ActivatedRoute, NavigationEnd, Router
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MetadataProfileDto, UserWorkspaceFullDto } from '@studio-lite-lib/api-dto';
import {
  filter, Subject, takeUntil, takeWhile
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MDProfile } from '@iqb/metadata';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitDataAreaComponent } from '../unit-data-area/unit-data-area.component';
import { UnitsAreaComponent } from '../units-area/units-area.component';
import { SplitterPaneComponent } from '../../../splitter/components/splitter-pane/splitter-pane.component';
import { SplitterComponent } from '../../../splitter/components/splitter/splitter.component';
import { RoutingHelperService } from '../../services/routing-helper.service';
import { WorkspaceSettings } from '../../../wsg-admin/models/workspace-settings.interface';

@Component({
  selector: 'studio-lite-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
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
  private userId = 0;
  private workspaceSettings : WorkspaceSettings | null = null;

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
  }

  ngOnInit(): void {
    this.workspaceService.workspaceSettings$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(settings => {
        if (settings) {
          this.workspaceSettings = settings;
          ['unit', 'item'].forEach(type => {
            this.initProfile(type).then(profile => this.loadProfile(profile));
          });
        }
      });

    this.workspaceService.resetUnitList([]);
    const workspaceKey = 'ws';
    this.workspaceService.selectedWorkspaceId = Number(this.route.snapshot.params[workspaceKey]);
    this.userId = this.appService.authData.userId;
    if (this.userId === 0) {
      this.appService.authDataChanged
        .pipe(
          takeUntil(this.ngUnsubscribe),
          takeWhile(() => this.userId === 0)
        )
        .subscribe(authData => {
          if (authData.userId !== 0) {
            this.fetchUserWorkspaceDataForUser();
            this.userId = authData.userId;
          }
        });
    } else {
      this.fetchUserWorkspaceDataForUser();
    }
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

  private async initProfile(profileType: string): Promise<MetadataProfileDto | null> {
    const profileKey = profileType === 'unit' ? 'unitMDProfile' : 'itemMDProfile';
    const profileId = this.workspaceSettings?.[profileKey];
    if (!profileId) {
      return null;
    }
    return this.workspaceService.getProfile(profileId, profileType);
  }

  private async loadProfile(profile: MetadataProfileDto | null): Promise<void> {
    if (profile) {
      try {
        await this.workspaceService.loadProfileVocabularies(new MDProfile(profile));
      } catch (error) {
        this.snackBar.open(
          this.translateService.instant('workspace.profile-not-loaded', { profileUrl: 'profile' }),
          this.translateService.instant('error'),
          { duration: 5000 }
        );
      }
    }
  }

  private fetchUserWorkspaceDataForUser(): void {
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
  }

  private openSecondaryOutlet(url: string): void {
    const secondaryOutletTab = RoutingHelperService
      .getSecondaryOutlet(url, this.routingOutlet, this.secondaryRoutingOutlet);
    this.pinnedNavTab = secondaryOutletTab ? [{ name: secondaryOutletTab, duplicable: true }] : [];
  }

  private async initWorkspace(workspace: UserWorkspaceFullDto) {
    this.workspaceService.selectedWorkspaceName = `${workspace.groupName}: ${workspace.name}`;
    this.workspaceService.groupId = workspace.groupId || 0;
    this.workspaceService.dropBoxId = workspace.dropBoxId;
    this.appService.appConfig.setPageTitle(this.workspaceService.selectedWorkspaceName);
    this.workspaceService.setWorkspaceGroupStates();

    if (workspace.settings) {
      this.workspaceService.workspaceSettings = workspace.settings;
    }
    this.workspaceService.userAccessLevel = workspace.userAccessLevel;
    this.workspaceService.isWorkspaceGroupAdmin =
      this.appService.isWorkspaceGroupAdmin(this.workspaceService.selectedWorkspaceId);
    await this.moduleService.loadList();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

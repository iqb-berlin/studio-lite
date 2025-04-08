import { Directive, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceBackendService } from '../services/workspace-backend.service';
import { RoutingHelperService } from '../services/routing-helper.service';

@Directive()
export abstract class SelectUnitDirective {
  @Input() selectedRouterLink!: number;
  @Input() navLinks!: string[];

  abstract workspaceService: WorkspaceService;
  abstract router: Router;
  abstract route: ActivatedRoute;

  abstract backendService: WorkspaceBackendService;

  secondaryRoutingOutlet: string = 'secondary';
  routingOutlet: string = 'primary';

  updateUnitList(unitToSelect?: number): void {
    this.backendService.getUnitGroups(this.workspaceService.selectedWorkspaceId)
      .subscribe(groups => {
        this.workspaceService.workspaceSettings.unitGroups = groups;
      });
    let queryParams = new HttpParams();
    queryParams = queryParams
      .append('targetWorkspaceId', this.workspaceService.selectedWorkspaceId)
      .append('withLastSeenCommentTimeStamp', true);
    this.backendService.getUnitList(this.workspaceService.selectedWorkspaceId, queryParams).subscribe(
      units => {
        this.workspaceService.resetUnitList(units);
        this.workspaceService.hasDroppedUnits = units
          .some(unit => unit.targetWorkspaceId === this.workspaceService.selectedWorkspaceId);
        if (unitToSelect) this.selectUnit(unitToSelect);
        if (units.length === 0) {
          this.workspaceService.selectedUnit$.next(0);
          this.router.navigate([`/a/${this.workspaceService.selectedWorkspaceId}`]);
        }
      }
    );
  }

  async selectUnit(unitId?: number): Promise<boolean> {
    if (unitId) {
      const selectedTab = this.selectedRouterLink;
      const routeSuffix = selectedTab >= 0 ? `/${this.navLinks[selectedTab]}` : '';
      const secondaryOutletTab = RoutingHelperService.getSecondaryOutlet(
        this.router.routerState.snapshot.url,
        this.routingOutlet,
        this.secondaryRoutingOutlet
      );
      if (secondaryOutletTab) {
        return this.router.navigate([`${unitId}${routeSuffix}`], { relativeTo: this.route.parent })
          .then(() => this.router
            .navigate([{ outlets: { secondary: [secondaryOutletTab] } }], { relativeTo: this.route })
          );
      }
      return this.router.navigate([`${unitId}${routeSuffix}`], { relativeTo: this.route.parent });
    }
    return this.router.navigate(
      [`a/${this.workspaceService.selectedWorkspaceId}`],
      { relativeTo: this.route.root }
    );
  }
}

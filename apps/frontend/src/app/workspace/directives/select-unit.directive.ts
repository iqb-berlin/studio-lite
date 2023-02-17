import { Directive, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { WorkspaceService } from '../workspace.service';
import { BackendService } from '../backend.service';

@Directive()
export abstract class SelectUnitDirective {
  @Input() selectedRouterLink!: number;
  @Input() navLinks!: string[];

  abstract workspaceService: WorkspaceService;
  abstract router: Router;
  abstract route: ActivatedRoute;

  abstract backendService: BackendService;

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
    if (unitId) {
      const selectedTab = this.selectedRouterLink;
      const routeSuffix = selectedTab >= 0 ? `/${this.navLinks[selectedTab]}` : '';
      return this.router.navigate([`${unitId}${routeSuffix}`], { relativeTo: this.route.parent });
    }
    return this.router.navigate(
      [`a/${this.workspaceService.selectedWorkspaceId}`],
      { relativeTo: this.route.root }
    );
  }
}

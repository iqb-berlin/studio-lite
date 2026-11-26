import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlSegmentGroup,
  UrlTree,
  PRIMARY_OUTLET
} from '@angular/router';
import { map, Observable } from 'rxjs';
import { WorkspaceService } from '../services/workspace.service';
import { BackendService as AppBackendService } from '../../../services/backend.service';
import { AppService } from '../../../services/app.service';

/**
 * Keeps the views a workspace has switched off out of reach, even when their URL is entered or
 * bookmarked: such a route is redirected to the unit's properties, which every workspace has.
 *
 * It decides by the settings of the workspace in the URL. The workspace loads them itself, but only
 * once the router has let its views through: after a reload none are there yet, and coming from
 * another workspace they are that one's. Then the guard asks for them itself (#2223).
 */
@Injectable({
  providedIn: 'root'
})
export class HiddenRouteGuard {
  constructor(
    private workspaceService: WorkspaceService,
    private appBackendService: AppBackendService,
    private appService: AppService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    const workspaceId = Number(route.pathFromRoot.map(snapshot => snapshot.paramMap.get('ws')).find(id => id));
    if (this.workspaceService.settingsLoaded() && this.workspaceService.selectedWorkspaceId === workspaceId) {
      return this.decide(route, state, this.workspaceService.hiddenRoutes());
    }
    // the user is known by now: the auth guard of the workspace route runs before this one and waits
    // for the login; a failed request lets the view through, as the workspace reports the failure
    return this.appBackendService
      .getUserWorkspaceData(workspaceId, this.appService.authData.userId)
      .pipe(map(workspace => this.decide(route, state, workspace?.settings?.hiddenRoutes ?? [])));
  }

  private decide(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    hiddenRoutes: string[]
  ): boolean | UrlTree {
    const targetRoute = route.routeConfig?.path;
    if (!targetRoute || !hiddenRoutes.includes(targetRoute)) return true;
    const tree = this.router.parseUrl(state.url);
    // With a view pinned beside it, the views are children of the unit's group
    // (`/a/5/7/(editor//secondary:preview)`): the last segment of the top group is the unit id, and
    // replacing it led to a unit "properties" (#2013).
    const groups = HiddenRouteGuard.primaryGroups(tree.root.children[PRIMARY_OUTLET]);
    if (route.outlet !== PRIMARY_OUTLET) {
      // a hidden view pinned beside the other one is unpinned
      const parent = groups.find(group => group.children[route.outlet]);
      if (!parent) return false;
      delete parent.children[route.outlet];
      return tree;
    }
    const segments = groups[groups.length - 1]?.segments || [];
    if (segments.length > 0) segments[segments.length - 1].path = 'properties';
    return tree;
  }

  /** The groups from this one down the primary outlet, the deepest last: it holds the view. */
  private static primaryGroups(group: UrlSegmentGroup | undefined): UrlSegmentGroup[] {
    return group ? [group, ...HiddenRouteGuard.primaryGroups(group.children[PRIMARY_OUTLET])] : [];
  }
}

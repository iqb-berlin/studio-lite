import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlSegmentGroup,
  UrlTree,
  PRIMARY_OUTLET
} from '@angular/router';
import { WorkspaceService } from '../services/workspace.service';

/**
 * Keeps the views a workspace has switched off out of reach, even when their URL is entered or
 * bookmarked: such a route is redirected to the unit's properties, which every workspace has.
 */
@Injectable({
  providedIn: 'root'
})
export class HiddenRouteGuard {
  constructor(
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const hiddenRoutes = this.workspaceService.workspaceSettings?.hiddenRoutes || [];
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

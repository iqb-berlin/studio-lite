import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy, Params } from '@angular/router';

/**
 * Builds an area of the studio anew when its address names another one (#2242).
 *
 * A workspace, the administration of a group and a review are each entered through a route that loads
 * their module and carries their id (`a/:ws`, `wsg-admin/:wsg`, `review/:review`), and their components
 * read that id once, when they are built. Angular keeps a route whose parameters changed, and the
 * components with it: the address of another workspace's unit, pasted into the open studio, went on
 * showing the workspace before and looked for the unit in it. Such a route is now built anew, as when the
 * area is entered from the start page. Within an area -- another unit, another tab -- all is kept.
 */
@Injectable()
export class AreaRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (!super.shouldReuseRoute(future, curr)) return false;
    return !future.routeConfig?.loadChildren || AreaRouteReuseStrategy.sameParams(future.params, curr.params);
  }

  private static sameParams(a: Params, b: Params): boolean {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(key => a[key] === b[key]);
  }
}

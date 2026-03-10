import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { WorkspaceService } from '../services/workspace.service';

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

    if (targetRoute && hiddenRoutes.includes(targetRoute)) {
      // redirect to properties if route is hidden
      const tree = this.router.parseUrl(state.url);
      // replace the last segment (the hidden route) with 'properties'
      const children = tree.root.children as any;
      const segments = children.primary.segments;
      if (segments.length > 0) {
        segments[segments.length - 1].path = 'properties';
      }
      return tree;
    }
    return true;
  }
}

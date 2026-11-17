import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree
} from '@angular/router';
import {
  filter, map, Observable, take
} from 'rxjs';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { AppService } from '../services/app.service';

/**
 * Lets through whoever the auth data allows, and sends everyone else to the start page -- without
 * a way back, since the page would refuse them again. Like {@link authGuard} it decides only once
 * the authentication has settled; it stands behind that guard, which deals with not being logged in.
 */
function allowWhen(mayEnter: (authData: AuthDataDto) => boolean): Observable<boolean | UrlTree> {
  const appService = inject(AppService);
  const router = inject(Router);
  return appService.authInitializationStatus$.pipe(
    filter(status => status === 'complete'),
    take(1),
    map(() => (mayEnter(appService.authData) ? true : router.createUrlTree(['/home'])))
  );
}

/** The administration of the installation, for administrators only (#2155). */
export const adminGuard: CanActivateFn = () => allowWhen(authData => authData.isAdmin);

/**
 * The administration of the group named by the route's `wsg`: for administrators, and for the
 * admins of that group as the auth data lists them -- the entries the start page shows its link
 * to this page for (#2155).
 */
export const workspaceGroupAdminGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const groupId = Number(route.paramMap.get('wsg'));
  return allowWhen(authData => authData.isAdmin ||
    authData.workspaces.some(group => group.id === groupId && group.isAdmin));
};

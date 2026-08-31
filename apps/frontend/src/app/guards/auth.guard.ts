import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree
} from '@angular/router';
import {
  filter, map, Observable, take
} from 'rxjs';
import { AppService } from '../services/app.service';

/**
 * Lets a logged-in user through and sends everyone else to the start page, remembering where they
 * were headed.
 *
 * It waits for the authentication to have settled before deciding: at start-up the token is checked
 * against the server, and answering before that is done would throw a returning user out of the page
 * they opened.
 */
export const authGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const appService = inject(AppService);
  const router = inject(Router);

  return appService.authInitializationStatus$.pipe(
    filter(status => status === 'complete'),
    take(1),
    map(() => {
      if (appService.authData.userId > 0) {
        return true;
      }
      return router.createUrlTree(['/home'], { queryParams: { redirectTo: state.url } });
    })
  );
};

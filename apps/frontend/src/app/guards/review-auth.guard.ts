import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree
} from '@angular/router';
import {
  filter, map, Observable, take
} from 'rxjs';
import { AppService } from '../services/app.service';

// Access to a review is granted to logged-in users AND to anonymous
// review sessions (password-protected review links): those authenticate
// with userId 0 and carry their single review in authData.reviews, so
// the generic authGuard's userId check must not be applied here.
export const reviewAuthGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const appService = inject(AppService);
  const router = inject(Router);

  return appService.authInitializationStatus$.pipe(
    filter(status => status === 'complete'),
    take(1),
    map(() => {
      const { authData } = appService;
      if (authData.userId > 0) {
        return true;
      }
      const requestedReviewId = Number(route.paramMap.get('review'));
      const hasReviewSession = !!requestedReviewId &&
        !!authData.reviews?.some(review => review.id === requestedReviewId);
      if (hasReviewSession) {
        return true;
      }
      return router.createUrlTree(['/home'], { queryParams: { redirectTo: state.url } });
    })
  );
};

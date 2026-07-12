import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot, convertToParamMap, Router, RouterStateSnapshot, UrlTree
} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ReviewDto } from '@studio-lite-lib/api-dto';
import { reviewAuthGuard } from './review-auth.guard';
import { AppService } from '../services/app.service';

describe('reviewAuthGuard', () => {
  let router: Router;
  let authStatus$: BehaviorSubject<'pending' | 'complete'>;
  let mockAuthData: { userId: number; reviews: ReviewDto[] };

  const routeWithReview = (reviewParam: string): ActivatedRouteSnapshot => ({
    paramMap: convertToParamMap({ review: reviewParam })
  } as ActivatedRouteSnapshot);

  const runGuard = (
    route: ActivatedRouteSnapshot,
    url = '/review/2/start'
  ): Observable<boolean | UrlTree> => TestBed.runInInjectionContext(
    () => reviewAuthGuard(route, { url } as RouterStateSnapshot)
  ) as Observable<boolean | UrlTree>;

  beforeEach(() => {
    authStatus$ = new BehaviorSubject<'pending' | 'complete'>('complete');
    mockAuthData = { userId: 0, reviews: [] };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppService,
          useValue: {
            authInitializationStatus$: authStatus$,
            get authData() { return mockAuthData; }
          }
        },
        {
          provide: Router,
          useValue: {
            createUrlTree: jest.fn().mockReturnValue({} as UrlTree),
            navigate: jest.fn()
          }
        }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should allow logged-in users', done => {
    mockAuthData.userId = 1;

    runGuard(routeWithReview('2')).subscribe(val => {
      expect(val).toBe(true);
      done();
    });
  });

  it('should allow an anonymous review session for its own review', done => {
    mockAuthData.userId = 0;
    mockAuthData.reviews = [{ id: 2 } as ReviewDto];

    runGuard(routeWithReview('2')).subscribe(val => {
      expect(val).toBe(true);
      done();
    });
  });

  it('should redirect an anonymous review session requesting another review', done => {
    mockAuthData.userId = 0;
    mockAuthData.reviews = [{ id: 2 } as ReviewDto];

    runGuard(routeWithReview('3'), '/review/3/start').subscribe(val => {
      expect(val).not.toBe(true);
      expect(router.createUrlTree)
        .toHaveBeenCalledWith(['/home'], { queryParams: { redirectTo: '/review/3/start' } });
      done();
    });
  });

  it('should redirect unauthenticated visitors to home with redirect target', done => {
    mockAuthData.userId = 0;
    mockAuthData.reviews = [];

    runGuard(routeWithReview('2')).subscribe(val => {
      expect(val).not.toBe(true);
      expect(router.createUrlTree)
        .toHaveBeenCalledWith(['/home'], { queryParams: { redirectTo: '/review/2/start' } });
      done();
    });
  });
});

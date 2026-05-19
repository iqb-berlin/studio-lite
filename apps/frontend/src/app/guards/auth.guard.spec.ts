import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { authGuard } from './auth.guard';
import { AppService } from '../services/app.service';

describe('authGuard', () => {
  let router: Router;
  let authStatus$: BehaviorSubject<'pending' | 'complete'>;
  let mockAuthData: { userId: number };

  beforeEach(() => {
    authStatus$ = new BehaviorSubject<'pending' | 'complete'>('pending');
    mockAuthData = { userId: 0 };

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

  it('should return true if authenticated and complete', done => {
    authStatus$.next('complete');
    mockAuthData.userId = 1;

    const result = TestBed.runInInjectionContext(() => authGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/test' } as RouterStateSnapshot
    ));

    if (typeof result === 'boolean') {
      expect(result).toBe(true);
      done();
    } else {
      result.subscribe(val => {
        expect(val).toBe(true);
        done();
      });
    }
  });

  it('should redirect to home if not authenticated and complete', done => {
    authStatus$.next('complete');
    mockAuthData.userId = 0;

    const result = TestBed.runInInjectionContext(() => authGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/test' } as RouterStateSnapshot
    ));

    if (typeof result === 'boolean') {
      expect(result).not.toBe(true);
      done();
    } else {
      result.subscribe(val => {
        expect(val).not.toBe(true);
        expect(router.createUrlTree).toHaveBeenCalledWith(['/home'], { queryParams: { redirectTo: '/test' } });
        done();
      });
    }
  });

  it('should wait for status to be complete', fakeAsync(() => {
    let resolvedValue: boolean | UrlTree | null = null;
    const result = TestBed.runInInjectionContext(() => authGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/test' } as RouterStateSnapshot
    ));

    result.subscribe(val => {
      resolvedValue = val;
    });

    tick();
    expect(resolvedValue).toBeNull();

    mockAuthData.userId = 1;
    authStatus$.next('complete');
    tick();

    expect(resolvedValue).toBe(true);
  }));
});

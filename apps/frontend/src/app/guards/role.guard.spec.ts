import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot, CanActivateFn, convertToParamMap, Router, RouterStateSnapshot, UrlTree
} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthDataDto, WorkspaceGroupDto } from '@studio-lite-lib/api-dto';
import { adminGuard, workspaceGroupAdminGuard } from './role.guard';
import { AppService } from '../services/app.service';

describe('role guards', () => {
  const home = {} as UrlTree;
  let authStatus$: BehaviorSubject<'pending' | 'complete'>;
  let authData: AuthDataDto;
  let router: Router;

  const group = (id: number, isAdmin: boolean): WorkspaceGroupDto => ({
    id, name: `group ${id}`, isAdmin, workspaces: []
  });
  const loggedIn = (isAdmin: boolean, workspaces: WorkspaceGroupDto[]): AuthDataDto => ({
    userId: 1, userName: 'user', userLongName: '', isAdmin, workspaces, reviews: []
  });

  const decide = (guard: CanActivateFn, wsg?: string): boolean | UrlTree | null => {
    let decision: boolean | UrlTree | null = null;
    const route = { paramMap: convertToParamMap(wsg ? { wsg } : {}) } as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => guard(route, {} as RouterStateSnapshot));
    (result as Observable<boolean | UrlTree>).subscribe(value => { decision = value; });
    return decision;
  };

  beforeEach(() => {
    authStatus$ = new BehaviorSubject<'pending' | 'complete'>('complete');
    authData = loggedIn(false, []);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AppService,
          useValue: {
            authInitializationStatus$: authStatus$,
            get authData() { return authData; }
          }
        },
        { provide: Router, useValue: { createUrlTree: jest.fn().mockReturnValue(home) } }
      ]
    });
    router = TestBed.inject(Router);
  });

  it('should decide only once the authentication has settled', fakeAsync(() => {
    authStatus$.next('pending');
    authData = loggedIn(true, []);
    let decision: boolean | UrlTree | null = null;
    const result = TestBed.runInInjectionContext(
      () => adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    (result as Observable<boolean | UrlTree>).subscribe(value => { decision = value; });
    tick();
    expect(decision).toBeNull();

    authStatus$.next('complete');
    tick();
    expect(decision).toBe(true);
  }));

  describe('adminGuard', () => {
    it('should let an administrator in', () => {
      authData = loggedIn(true, []);
      expect(decide(adminGuard)).toBe(true);
    });

    it('should send anyone else to the start page, with no way back (#2155)', () => {
      authData = loggedIn(false, [group(5, true)]);
      expect(decide(adminGuard)).toBe(home);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('workspaceGroupAdminGuard', () => {
    it('should let an administrator into any group', () => {
      authData = loggedIn(true, []);
      expect(decide(workspaceGroupAdminGuard, '5')).toBe(true);
    });

    it('should let the admin of the group in', () => {
      authData = loggedIn(false, [group(5, true)]);
      expect(decide(workspaceGroupAdminGuard, '5')).toBe(true);
    });

    it('should send a member of the group to the start page (#2155)', () => {
      authData = loggedIn(false, [group(5, false)]);
      expect(decide(workspaceGroupAdminGuard, '5')).toBe(home);
    });

    it('should send the admin of another group to the start page (#2155)', () => {
      authData = loggedIn(false, [group(5, false), group(7, true)]);
      expect(decide(workspaceGroupAdminGuard, '5')).toBe(home);
    });
  });
});

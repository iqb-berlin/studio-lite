import { TestBed } from '@angular/core/testing';
import {
  Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree
} from '@angular/router';
import { WorkspaceService } from '../services/workspace.service';
import { HiddenRouteGuard } from './hidden-route.guard';

describe('HiddenRouteGuard', () => {
  let guard: HiddenRouteGuard;
  let workspaceServiceMock: { workspaceSettings?: { hiddenRoutes: string[] } };
  let routerMock: { parseUrl: jest.Mock };

  beforeEach(() => {
    workspaceServiceMock = {
      workspaceSettings: {
        hiddenRoutes: ['editor', 'preview']
      }
    };

    routerMock = {
      parseUrl: jest.fn().mockReturnValue({
        root: {
          children: {
            primary: {
              segments: [{ path: 'ws' }, { path: 'editor' }]
            }
          }
        }
      })
    };

    TestBed.configureTestingModule({
      providers: [
        HiddenRouteGuard,
        { provide: WorkspaceService, useValue: workspaceServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(HiddenRouteGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect to properties if route is hidden', () => {
    const route = {
      routeConfig: { path: 'editor' }
    } as unknown as ActivatedRouteSnapshot;

    const state = { url: '/a/1/ws/1/1/editor' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state) as UrlTree;

    expect(result).toBeTruthy();
    expect(routerMock.parseUrl).toHaveBeenCalledWith('/a/1/ws/1/1/editor');
    // We mock parsed UrlTree to test if path is modified
    const rootNode = (result as unknown as { root: { children: { primary: { segments: { path: string }[] } } } }).root;
    expect(rootNode.children.primary.segments[1].path).toBe('properties');
  });

  it('should return true if route is not hidden', () => {
    const route = {
      routeConfig: { path: 'schemer' }
    } as unknown as ActivatedRouteSnapshot;

    const state = { url: '/a/1/ws/1/1/schemer' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(true);
    expect(routerMock.parseUrl).not.toHaveBeenCalled();
  });

  it('should return true if hiddenRoutes is undefined', () => {
    workspaceServiceMock.workspaceSettings = undefined;

    const route = {
      routeConfig: { path: 'editor' }
    } as unknown as ActivatedRouteSnapshot;

    const state = { url: '/a/1/ws/1/1/editor' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(true);
  });
});

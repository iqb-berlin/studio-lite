import { TestBed } from '@angular/core/testing';
import {
  Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, DefaultUrlSerializer, PRIMARY_OUTLET
} from '@angular/router';
import { WorkspaceService } from '../services/workspace.service';
import { HiddenRouteGuard } from './hidden-route.guard';

describe('HiddenRouteGuard', () => {
  let guard: HiddenRouteGuard;
  let workspaceServiceMock: { workspaceSettings?: { hiddenRoutes: string[] } };
  let routerMock: { parseUrl: jest.Mock };
  const serializer = new DefaultUrlSerializer();

  beforeEach(() => {
    workspaceServiceMock = {
      workspaceSettings: {
        hiddenRoutes: ['editor']
      }
    };

    routerMock = {
      parseUrl: jest.fn((url: string) => serializer.parse(url))
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

  // Beside a pinned view the unit id was replaced instead of the view, leading to a unit
  // "properties" (#2013).
  it.each([
    ['a hidden view to the properties', 'editor', PRIMARY_OUTLET, '/a/5/7/editor', '/a/5/7/properties'],
    ['a hidden view beside a pinned one to the properties', 'editor', PRIMARY_OUTLET,
      '/a/5/7/(editor//secondary:preview)', '/a/5/7/(properties//secondary:preview)'],
    ['a hidden pinned view by unpinning it', 'editor', 'secondary',
      '/a/5/7/(preview//secondary:editor)', '/a/5/7/preview']
  ])('should redirect %s', (_case, path, outlet, url, redirect) => {
    const route = { routeConfig: { path }, outlet } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(route, { url } as RouterStateSnapshot) as UrlTree;

    expect(serializer.serialize(result)).toBe(redirect);
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

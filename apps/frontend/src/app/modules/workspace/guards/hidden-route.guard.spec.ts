import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import {
  Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, DefaultUrlSerializer, PRIMARY_OUTLET,
  convertToParamMap
} from '@angular/router';
import {
  isObservable, lastValueFrom, Observable, of
} from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import { UserWorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../services/workspace.service';
import { BackendService as AppBackendService } from '../../../services/backend.service';
import { AppService } from '../../../services/app.service';
import { HiddenRouteGuard } from './hidden-route.guard';

describe('HiddenRouteGuard', () => {
  let guard: HiddenRouteGuard;
  // the settings the workspace service holds: loaded, of workspace 5, hiding the editor
  let workspaceServiceMock: {
    settingsLoaded: WritableSignal<boolean>;
    selectedWorkspaceId: number;
    hiddenRoutes: WritableSignal<string[]>;
  };
  let getUserWorkspaceData: jest.Mock<Observable<UserWorkspaceFullDto | null>, [number, number]>;
  const serializer = new DefaultUrlSerializer();

  /** The snapshot of a view of a unit in workspace 5, as the router hands it over. */
  const viewRoute = (path: string, outlet = PRIMARY_OUTLET) => createMock<ActivatedRouteSnapshot>({
    routeConfig: { path },
    outlet,
    pathFromRoot: [{}, { ws: '5' }, { u: '7' }, {}]
      .map(params => createMock<ActivatedRouteSnapshot>({ paramMap: convertToParamMap(params) }))
  });

  const decide = async (route: ActivatedRouteSnapshot, url: string): Promise<boolean | UrlTree> => {
    const result = guard.canActivate(route, createMock<RouterStateSnapshot>({ url }));
    return isObservable(result) ? lastValueFrom(result) : result;
  };

  // A plain object: of() would take a createMock proxy, which answers to "schedule", for a scheduler.
  const workspaceHiding = (hiddenRoutes: string[]): UserWorkspaceFullDto => ({
    id: 5,
    name: 'Bereich',
    groupId: 1,
    groupName: 'Gruppe',
    userAccessLevel: 2,
    dropBoxId: 0,
    settings: {
      defaultEditor: '', defaultPlayer: '', defaultSchemer: '', hiddenRoutes
    }
  });

  beforeEach(() => {
    workspaceServiceMock = {
      settingsLoaded: signal(true),
      selectedWorkspaceId: 5,
      hiddenRoutes: signal(['editor'])
    };
    getUserWorkspaceData = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        HiddenRouteGuard,
        { provide: WorkspaceService, useValue: workspaceServiceMock },
        { provide: AppBackendService, useValue: { getUserWorkspaceData } },
        { provide: AppService, useValue: { authData: { userId: 9 } } },
        { provide: Router, useValue: { parseUrl: (url: string) => serializer.parse(url) } }
      ]
    });

    guard = TestBed.inject(HiddenRouteGuard);
  });

  // Beside a pinned view the unit id was replaced instead of the view, leading to a unit
  // "properties" (#2013).
  it.each([
    ['a hidden view to the properties', PRIMARY_OUTLET, '/a/5/7/editor', '/a/5/7/properties'],
    ['a hidden view beside a pinned one to the properties', PRIMARY_OUTLET,
      '/a/5/7/(editor//secondary:preview)', '/a/5/7/(properties//secondary:preview)'],
    ['a hidden pinned view by unpinning it', 'secondary',
      '/a/5/7/(preview//secondary:editor)', '/a/5/7/preview']
  ])('should redirect %s by the settings it holds', async (_case, outlet, url, redirect) => {
    const result = await decide(viewRoute('editor', outlet), url) as UrlTree;

    expect(serializer.serialize(result)).toBe(redirect);
    expect(getUserWorkspaceData).not.toHaveBeenCalled();
  });

  it('should let a view through that is not hidden', async () => {
    expect(await decide(viewRoute('schemer'), '/a/5/7/schemer')).toBe(true);
  });

  // After a reload the workspace has not loaded its settings yet, and a hidden view opened (#2223).
  it('should ask for the settings of the workspace when none are loaded', async () => {
    workspaceServiceMock.settingsLoaded.set(false);
    workspaceServiceMock.hiddenRoutes.set([]);
    getUserWorkspaceData.mockReturnValue(of(workspaceHiding(['notes'])));

    const result = await decide(viewRoute('notes'), '/a/5/7/notes') as UrlTree;

    expect(getUserWorkspaceData).toHaveBeenCalledWith(5, 9);
    expect(serializer.serialize(result)).toBe('/a/5/7/properties');
  });

  // Coming from another workspace, its settings decided: a view it hides was redirected here (#2223).
  it('should ask for the settings of the workspace when those held are another one\'s', async () => {
    workspaceServiceMock.selectedWorkspaceId = 4;
    getUserWorkspaceData.mockReturnValue(of(workspaceHiding([])));

    expect(await decide(viewRoute('editor'), '/a/5/7/editor')).toBe(true);
    expect(getUserWorkspaceData).toHaveBeenCalledWith(5, 9);
  });

  it('should let the view through when the settings cannot be loaded', async () => {
    workspaceServiceMock.settingsLoaded.set(false);
    getUserWorkspaceData.mockReturnValue(of(null));

    expect(await decide(viewRoute('editor'), '/a/5/7/editor')).toBe(true);
  });
});

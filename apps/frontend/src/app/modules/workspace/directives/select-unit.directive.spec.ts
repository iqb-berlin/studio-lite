import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceBackendService } from '../services/workspace-backend.service';
import { RoutingHelperService } from '../services/routing-helper.service';
import { SelectUnitDirective } from './select-unit.directive';

type WorkspaceServiceStub = {
  selectedWorkspaceId: number;
  workspaceSettings: { unitGroups: string[] };
  resetUnitList: jest.MockedFunction<WorkspaceService['resetUnitList']>;
  selectedUnit$: BehaviorSubject<number>;
  hasDroppedUnits: boolean;
};

type BackendServiceStub = {
  getUnitGroups: jest.MockedFunction<WorkspaceBackendService['getUnitGroups']>;
  getUnitList: jest.MockedFunction<WorkspaceBackendService['getUnitList']>;
};

type RouterStub = {
  navigate: jest.MockedFunction<Router['navigate']>;
  routerState: { snapshot: { url: string } };
};

type RouteStub = {
  parent: unknown;
  root: unknown;
};

class TestSelectUnitDirective extends SelectUnitDirective {
  workspaceService: WorkspaceService;
  router: Router;
  route: ActivatedRoute;
  ngUnsubscribe = new Subject<void>();
  backendService: WorkspaceBackendService;

  constructor(
    workspaceService: WorkspaceService,
    router: Router,
    route: ActivatedRoute,
    backendService: WorkspaceBackendService
  ) {
    super();
    this.workspaceService = workspaceService;
    this.router = router;
    this.route = route;
    this.backendService = backendService;
    this.selectedRouterLink = 1;
    this.navLinks = ['first', 'second'];
  }
}

describe('SelectUnitDirective', () => {
  let directive: TestSelectUnitDirective;
  let workspaceServiceMock: WorkspaceServiceStub;
  let backendServiceMock: BackendServiceStub;
  let routerMock: RouterStub;
  let routeMock: RouteStub;

  beforeEach(() => {
    workspaceServiceMock = {
      selectedWorkspaceId: 5,
      workspaceSettings: { unitGroups: [] as string[] },
      resetUnitList: jest.fn<
      ReturnType<WorkspaceService['resetUnitList']>,
      Parameters<WorkspaceService['resetUnitList']>
      >(),
      selectedUnit$: new BehaviorSubject<number>(0),
      hasDroppedUnits: false
    };

    const getUnitGroupsMock = jest.fn<
    ReturnType<WorkspaceBackendService['getUnitGroups']>,
    Parameters<WorkspaceBackendService['getUnitGroups']>
    >().mockReturnValue(of(['group-a']));

    const getUnitListMock = jest.fn<
    ReturnType<WorkspaceBackendService['getUnitList']>,
    Parameters<WorkspaceBackendService['getUnitList']>
    >().mockReturnValue(of([
      { id: 10, targetWorkspaceId: 5 } as UnitInListDto
    ]));

    backendServiceMock = {
      getUnitGroups: getUnitGroupsMock,
      getUnitList: getUnitListMock
    };

    routerMock = {
      navigate: jest.fn<
      ReturnType<Router['navigate']>,
      Parameters<Router['navigate']>
      >().mockResolvedValue(true),
      routerState: { snapshot: { url: '/a/5/second' } }
    };

    routeMock = {
      parent: {},
      root: {}
    };

    directive = new TestSelectUnitDirective(
      workspaceServiceMock as unknown as WorkspaceService,
      routerMock as unknown as Router,
      routeMock as unknown as ActivatedRoute,
      backendServiceMock as unknown as WorkspaceBackendService
    );
  });

  it('refreshes unit list and selects a unit when requested', () => {
    const selectSpy = jest.spyOn(directive, 'selectUnit').mockResolvedValue(true);

    directive.updateUnitList(10);

    expect(backendServiceMock.getUnitGroups).toHaveBeenCalledWith(5);
    expect(backendServiceMock.getUnitList).toHaveBeenCalledTimes(1);
    expect(workspaceServiceMock.workspaceSettings.unitGroups).toEqual(['group-a']);
    expect(workspaceServiceMock.resetUnitList).toHaveBeenCalled();
    expect(workspaceServiceMock.hasDroppedUnits).toBe(true);
    expect(selectSpy).toHaveBeenCalledWith(10);
  });

  it('navigates back to the workspace when the list is empty', () => {
    const selectedUnitSpy = jest.spyOn(workspaceServiceMock.selectedUnit$, 'next');
    backendServiceMock.getUnitList.mockReturnValueOnce(of([] as UnitInListDto[]));

    directive.updateUnitList();

    expect(selectedUnitSpy).toHaveBeenCalledWith(0);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/a/5']);
  });

  it('navigates to the unit and secondary outlet when available', async () => {
    jest.spyOn(RoutingHelperService, 'getSecondaryOutlet').mockReturnValue('details');

    await directive.selectUnit(12);

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['12/second'],
      { relativeTo: routeMock.parent }
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(
      [{ outlets: { secondary: ['details'] } }],
      { relativeTo: routeMock }
    );
  });

  it('navigates to the unit when no secondary outlet exists', async () => {
    jest.spyOn(RoutingHelperService, 'getSecondaryOutlet').mockReturnValue('');

    await directive.selectUnit(12);

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['12/second'],
      { relativeTo: routeMock.parent }
    );
  });

  it('navigates to the workspace when no unit id is provided', async () => {
    await directive.selectUnit();

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['a/5'],
      { relativeTo: routeMock.root }
    );
  });
});

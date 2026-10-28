// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  ActivatedRoute, Event, NavigationEnd, Router
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthDataDto, UserWorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { WorkspaceComponent } from './workspace.component';
import { AppConfig } from '../../../../classes/app-config.class';
import { AppService } from '../../../../services/app.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { ModuleService } from '../../../../services/module.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitDataAreaComponent } from '../unit-data-area/unit-data-area.component';
import { UnitsAreaComponent } from '../units-area/units-area.component';
import { SplitterPaneComponent } from '../../../splitter/components/splitter-pane/splitter-pane.component';
import { SplitterComponent } from '../../../splitter/components/splitter/splitter.component';

@Component({ selector: 'studio-lite-splitter', template: '<ng-content></ng-content>', standalone: true })
class MockSplitterComponent {}

@Component({ selector: 'studio-lite-splitter-pane', template: '<ng-content></ng-content>', standalone: true })
class MockSplitterPaneComponent {
  @Input() initialSize: number | 'auto' = 'auto';
}

@Component({ selector: 'studio-lite-units-area', template: '', standalone: true })
class MockUnitsAreaComponent {
  @Input() selectedRouterLink!: number;
  @Input() navLinks!: string[];
}

@Component({ selector: 'studio-lite-unit-data-area', template: '', standalone: true })
class MockUnitDataAreaComponent {
  @Input() navTabs!: { name: string; duplicable: boolean }[];
  @Input() routingOutlet = 'primary';
  @Input() secondaryRoutingOutlet!: string;
  @Input() pinIcon!: string;
  @Input() disabledRouterLink!: string;
  @Output() selectedRouterIndexChange = new EventEmitter<number>();
}

// A class rather than createMock: the login replaces authData before announcing it, as AppService does.
class MockAppService {
  authData: AuthDataDto;
  authDataChanged = new EventEmitter<AuthDataDto>();
  appConfig = createMock<AppConfig>();
  isWorkspaceGroupAdmin = jest.fn().mockReturnValue(false);

  constructor(userId: number) {
    this.authData = createMock<AuthDataDto>({ userId });
  }
}

describe('WorkspaceComponent', () => {
  let fixture: ComponentFixture<WorkspaceComponent>;
  let routerEvents: Subject<Event>;
  let appService: MockAppService;
  let appBackendService: DeepMocked<AppBackendService>;
  let snackBar: DeepMocked<MatSnackBar>;

  // A plain object: of() would take a createMock proxy, which answers to "schedule", for a scheduler.
  const loadedWorkspace: UserWorkspaceFullDto = {
    id: 5, name: 'Bereich', groupId: 1, groupName: 'Gruppe', userAccessLevel: 2, dropBoxId: 0
  };

  const configure = async (
    url: string,
    { userId = 1, workspace = loadedWorkspace }:
    { userId?: number, workspace?: UserWorkspaceFullDto | null } = {}
  ): Promise<void> => {
    routerEvents = new Subject<Event>();
    appService = new MockAppService(userId);
    appBackendService = createMock<AppBackendService>({
      getUserWorkspaceData: jest.fn().mockReturnValue(of(workspace))
    });
    snackBar = createMock<MatSnackBar>();

    await TestBed.configureTestingModule({
      imports: [WorkspaceComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: createMock<Router>({ events: routerEvents, routerState: { snapshot: { url } } }) },
        { provide: ActivatedRoute, useValue: createMock<ActivatedRoute>({ snapshot: { params: { ws: 5 } } }) },
        { provide: AppService, useValue: appService },
        { provide: AppBackendService, useValue: appBackendService },
        { provide: WorkspaceService, useValue: createMock<WorkspaceService>() },
        { provide: ModuleService, useValue: createMock<ModuleService>() },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
      .overrideComponent(WorkspaceComponent, {
        remove: { imports: [SplitterComponent, SplitterPaneComponent, UnitsAreaComponent, UnitDataAreaComponent] },
        add: {
          imports: [MockSplitterComponent, MockSplitterPaneComponent, MockUnitsAreaComponent, MockUnitDataAreaComponent]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkspaceComponent);
    fixture.detectChanges();
  };

  const dataAreas = (): number => fixture.nativeElement.querySelectorAll('studio-lite-unit-data-area').length;

  // A view pinned beside the unit's tab gets a column of its own (#1972).
  it.each([
    ['/a/5/7/(editor//secondary:preview)', 2],
    ['/a/5/7/editor', 1]
  ])('should show the workspace at %j with %i data areas', async (url, count) => {
    await configure(url);

    expect(dataAreas()).toBe(count);
  });

  it('should add the column when a view is pinned and remove it when it is closed', async () => {
    await configure('/a/5/7/editor');
    const navigateTo = (url: string): void => {
      routerEvents.next(new NavigationEnd(1, url, url));
      fixture.detectChanges();
    };

    navigateTo('/a/5/7/(editor//secondary:preview)');
    expect(dataAreas()).toBe(2);

    navigateTo('/a/5/7/editor');
    expect(dataAreas()).toBe(1);
  });

  it('should name the page after the group and the workspace', async () => {
    await configure('/a/5/7/editor');

    expect(appService.appConfig.setPageTitle).toHaveBeenCalledWith('Gruppe: Bereich');
  });

  it('should say when the workspace could not be loaded', async () => {
    await configure('/a/5/7/editor', { workspace: null });

    expect(snackBar.open).toHaveBeenCalledWith('workspace.workspace-not-loaded', 'error', { duration: 3000 });
  });

  it('should load the workspace once, for the user the login brings', async () => {
    await configure('/a/5/7/editor', { userId: 0 });
    const logIn = (userId: number): void => {
      appService.authData = createMock<AuthDataDto>({ userId });
      appService.authDataChanged.emit(appService.authData);
    };

    logIn(0);
    expect(appBackendService.getUserWorkspaceData).not.toHaveBeenCalled();

    logIn(3);
    logIn(4);
    expect(appBackendService.getUserWorkspaceData).toHaveBeenCalledTimes(1);
    expect(appBackendService.getUserWorkspaceData).toHaveBeenCalledWith(5, 3);
  });
});

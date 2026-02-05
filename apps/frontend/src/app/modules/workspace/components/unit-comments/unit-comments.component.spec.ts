import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { UnitItemDto, AuthDataDto } from '@studio-lite-lib/api-dto';
import { UnitCommentsComponent } from './unit-comments.component';
import { environment } from '../../../../../environments/environment';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';

describe('UnitCommentsComponent', () => {
  let component: UnitCommentsComponent;
  let fixture: ComponentFixture<UnitCommentsComponent>;
  let workspaceServiceMock: WorkspaceService;
  let appServiceMock: AppService;
  let backendServiceMock: jest.Mocked<WorkspaceBackendService>;

  const createItems = (): UnitItemDto[] => ([
    { id: '3', variableId: 'v3' },
    { id: '1', variableId: 'v1' },
    { id: '2', variableId: 'v2' }
  ]);

  beforeEach(async () => {
    backendServiceMock = {
      getUnitItems: jest.fn().mockReturnValue(of(createItems()))
    } as unknown as jest.Mocked<WorkspaceBackendService>;

    workspaceServiceMock = {
      selectedWorkspaceId: 7,
      selectedUnit$: new BehaviorSubject<number>(0)
    } as WorkspaceService;

    const authData: AuthDataDto = {
      userId: 5,
      userName: 'user',
      userLongName: 'User Long',
      isAdmin: false,
      workspaces: [],
      reviews: []
    };

    appServiceMock = {
      authData
    } as unknown as AppService;

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: WorkspaceBackendService,
          useValue: backendServiceMock
        },
        {
          provide: WorkspaceService,
          useValue: workspaceServiceMock
        },
        {
          provide: AppService,
          useValue: appServiceMock
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort unit items by id', () => {
    expect(component.unitItems.map(i => i.id)).toEqual(['1', '2', '3']);
  });

  it('should update user and unit data on selection change', fakeAsync(() => {
    workspaceServiceMock.selectedUnit$.next(99);
    tick();

    expect(component.unitId).toBe(99);
    expect(component.workspaceId).toBe(7);
    expect(component.userId).toBe(5);
    expect(component.userName).toBe('User Long');
  }));
});

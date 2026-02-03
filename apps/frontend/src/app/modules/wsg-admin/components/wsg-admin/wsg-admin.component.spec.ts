import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceGroupFullDto } from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of } from 'rxjs';
import { AppService } from '../../../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { WsgAdminComponent } from './wsg-admin.component';

describe('WsgAdminComponent', () => {
  let component: WsgAdminComponent;
  let fixture: ComponentFixture<WsgAdminComponent>;
  let mockWsgAdminService: {
    selectedWorkspaceGroupId: BehaviorSubject<number>;
    selectedWorkspaceGroupName: BehaviorSubject<string>;
    selectedWorkspaceGroupSettings: Record<string, unknown>;
  };
  let mockBackendService: {
    getWorkspaceGroupData: jest.Mock;
  };
  let mockAppService: {
    appConfig: { setPageTitle: jest.Mock };
  };

  beforeEach(async () => {
    mockWsgAdminService = {
      selectedWorkspaceGroupId: new BehaviorSubject<number>(0),
      selectedWorkspaceGroupName: new BehaviorSubject<string>(''),
      selectedWorkspaceGroupSettings: {}
    };
    mockBackendService = {
      getWorkspaceGroupData: jest.fn().mockReturnValue(of({
        name: 'Group 1',
        settings: { defaultEditor: 'e' }
      } as WorkspaceGroupFullDto))
    };
    mockAppService = {
      appConfig: {
        setPageTitle: jest.fn()
      }
    };

    await TestBed.configureTestingModule({
      imports: [WsgAdminComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: WsgAdminService, useValue: mockWsgAdminService },
        { provide: BackendService, useValue: mockBackendService },
        { provide: AppService, useValue: mockAppService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { wsg: '10' }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WsgAdminComponent);
    component = fixture.componentInstance;
  });

  it('should create and init', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(mockBackendService.getWorkspaceGroupData).toHaveBeenCalledWith(10);
    expect(mockWsgAdminService.selectedWorkspaceGroupName.value).toBe('Group 1');
    expect(mockAppService.appConfig.setPageTitle).toHaveBeenCalled();
    expect(mockWsgAdminService.selectedWorkspaceGroupSettings).toEqual({ defaultEditor: 'e' });
  });
});

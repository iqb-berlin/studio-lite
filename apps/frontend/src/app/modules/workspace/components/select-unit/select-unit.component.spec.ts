import { provideHttpClient, HttpParams } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { MatSelectModule } from '@angular/material/select';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';
import { SelectUnitComponent } from './select-unit.component';
import { environment } from '../../../../../environments/environment';

describe('SelectUnitComponent', () => {
  let component: SelectUnitComponent;
  let fixture: ComponentFixture<SelectUnitComponent>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '', standalone: false })
  class MockSelectUnitListComponent {
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() selectedUnitIds!: number[];
    @Input() workspace!: number;
    @Input() disabled!: number[];
    @Input() selectionCount!: number;
    @Input() multiple!: boolean;
    @Input() selectedUnitId!: number;
  }

  const authData: AuthDataDto = {
    userId: 10,
    userName: 'user',
    userLongName: 'User Long',
    isAdmin: false,
    workspaces: [
      {
        id: 1,
        name: 'Group A',
        isAdmin: false,
        workspaces: [
          { id: 11, name: 'Ws 1', userAccessLevel: 0 },
          { id: 12, name: 'Ws 2', userAccessLevel: 0 }
        ]
      }
    ],
    reviews: []
  };

  const createDialogData = (overrides: Partial<SelectUnitComponent['data']> = {}) => ({
    title: 'test',
    buttonLabel: 'test',
    fromOtherWorkspacesToo: false,
    multiple: false,
    selectedUnitId: 0,
    queryParams: new HttpParams(),
    ...overrides
  });

  const createWorkspaceServiceMock = () => ({
    selectedWorkspaceId: 42,
    selectedUnit$: new BehaviorSubject<number>(0)
  }) as WorkspaceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockSelectUnitListComponent
      ],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: createDialogData()
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: AppService,
          useValue: { authData }
        },
        {
          provide: WorkspaceService,
          useValue: createWorkspaceServiceMock()
        }
      ]
    })
      .compileComponents();
  });

  const setup = async (overrides: Partial<SelectUnitComponent['data']> = {}) => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      declarations: [
        MockSelectUnitListComponent
      ],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: createDialogData(overrides)
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: AppService,
          useValue: { authData }
        },
        {
          provide: WorkspaceService,
          useValue: createWorkspaceServiceMock()
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SelectUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create', async () => {
    await setup();

    expect(component)
      .toBeTruthy();
  });

  it('should create a form when selecting from other workspaces', async () => {
    await setup({ fromOtherWorkspacesToo: true });

    expect(component.selectForm).toBeTruthy();
  });

  it('should populate workspace list on init', async () => {
    await setup({ fromOtherWorkspacesToo: true });

    const appService = TestBed.inject(AppService) as unknown as { authData: AuthDataDto };
    appService.authData = authData;
    component.workspaceList = [];
    component.ngOnInit();

    expect(component.data.fromOtherWorkspacesToo).toBe(true);
    expect(appService.authData.userId).toBe(10);
    expect(appService.authData.workspaces.length).toBe(1);

    const ids = component.workspaceList.map(ws => ws.id);
    expect(ids).toEqual(expect.arrayContaining([11, 12]));
  });

  it('should update workspace via unitSelectionTable', async () => {
    await setup();

    const updateSpy = jest.fn();
    (component as { unitSelectionTable?: { updateUnitList: (value: number) => void } })
      .unitSelectionTable = { updateUnitList: updateSpy };

    component.updateWorkspace(99);

    expect(updateSpy).toHaveBeenCalledWith(99);
  });
});

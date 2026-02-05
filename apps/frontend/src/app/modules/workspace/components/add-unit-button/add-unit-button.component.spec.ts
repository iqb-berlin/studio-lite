import {
  ComponentFixture, TestBed, fakeAsync, flushMicrotasks
} from '@angular/core/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CreateUnitDto, UnitInListDto } from '@studio-lite-lib/api-dto';
import { AddUnitButtonComponent } from './add-unit-button.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';

describe('AddUnitButtonComponent', () => {
  let component: AddUnitButtonComponent;
  let fixture: ComponentFixture<AddUnitButtonComponent>;

  let backendService: {
    addUnit: jest.Mock<Observable<number | boolean>, [number, CreateUnitDto]>;
  };
  let appBackendService: {
    setWorkspaceSettings: jest.Mock<Observable<boolean>, [number, unknown]>;
  };
  let workspaceService: {
    selectedWorkspaceId: number;
    workspaceSettings: {
      unitGroups: string[];
      defaultPlayer: string;
      defaultEditor: string;
      defaultSchemer: string;
    };
  };
  let appService: { dataLoading: boolean };
  let snackBar: { open: jest.Mock<void, [string, string, { duration: number }]> };
  let translateService: TranslateService;
  let router: Router;
  let route: ActivatedRoute;

  beforeEach(async () => {
    backendService = {
      addUnit: jest.fn<Observable<number | boolean>, [number, CreateUnitDto]>(() => of(123))
    };
    appBackendService = {
      setWorkspaceSettings: jest.fn<Observable<boolean>, [number, unknown]>(() => of(true))
    };
    workspaceService = {
      selectedWorkspaceId: 5,
      workspaceSettings: {
        unitGroups: ['G1'],
        defaultPlayer: 'player-x',
        defaultEditor: 'editor-x',
        defaultSchemer: 'schemer-x'
      }
    };
    appService = { dataLoading: false };
    snackBar = { open: jest.fn() };
    router = { navigate: jest.fn() } as unknown as Router;
    route = { parent: {}, root: {} } as unknown as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [
        AddUnitButtonComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        { provide: WorkspaceBackendService, useValue: backendService },
        { provide: AppBackendService, useValue: appBackendService },
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: AppService, useValue: appService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route }
      ]
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => (
      Array.isArray(key) ? key.join(',') : key
    ));

    fixture = TestBed.createComponent(AddUnitButtonComponent);
    component = fixture.componentInstance;
    component.selectedUnitId = 1;
    component.disabled = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adds a new unit and refreshes the list', fakeAsync(() => {
    const createUnit: CreateUnitDto = {
      key: 'U1',
      name: 'Unit 1',
      groupName: 'G1'
    };
    const addUnitDialogSpy = jest.spyOn(
      component as unknown as { addUnitDialog: (data: unknown) => Promise<CreateUnitDto | boolean> },
      'addUnitDialog'
    );
    addUnitDialogSpy.mockResolvedValue(createUnit);
    const updateUnitListSpy = jest.spyOn(component, 'updateUnitList').mockImplementation(() => {});

    component.addUnit();
    flushMicrotasks();

    expect(backendService.addUnit).toHaveBeenCalledWith(5, {
      ...createUnit,
      player: 'player-x',
      editor: 'editor-x',
      schemer: 'schemer-x'
    });
    expect(updateUnitListSpy).toHaveBeenCalledWith(123);
    expect(appService.dataLoading).toBe(false);
  }));

  it('shows an error snackbar when adding a unit fails', fakeAsync(() => {
    backendService.addUnit.mockReturnValueOnce(of(false));
    const createUnit: CreateUnitDto = {
      key: 'U2',
      name: 'Unit 2',
      groupName: 'G1'
    };
    const addUnitDialogSpy = jest.spyOn(
      component as unknown as { addUnitDialog: (data: unknown) => Promise<CreateUnitDto | boolean> },
      'addUnitDialog'
    );
    addUnitDialogSpy.mockResolvedValue(createUnit);

    component.addUnit();
    flushMicrotasks();

    expect(snackBar.open).toHaveBeenCalledWith(
      'workspace.unit-not-added',
      'workspace.error',
      { duration: 3000 }
    );
    expect(appService.dataLoading).toBe(false);
  }));

  it('adds a unit from an existing source', fakeAsync(() => {
    const existing: UnitInListDto = {
      id: 11,
      key: 'U11',
      name: 'Unit 11',
      targetWorkspaceId: 5
    };
    const createUnit: CreateUnitDto = {
      key: 'U11',
      name: 'Unit 11 copy',
      groupName: 'G1'
    };
    const fromExistingSpy = jest.spyOn(
      component as unknown as { addUnitFromExistingDialog: () => Promise<UnitInListDto | boolean> },
      'addUnitFromExistingDialog'
    );
    fromExistingSpy.mockResolvedValue(existing);
    const addUnitDialogSpy = jest.spyOn(
      component as unknown as { addUnitDialog: (data: unknown) => Promise<CreateUnitDto | boolean> },
      'addUnitDialog'
    );
    addUnitDialogSpy.mockResolvedValue(createUnit);
    const updateUnitListSpy = jest.spyOn(component, 'updateUnitList').mockImplementation(() => {});

    component.addUnitFromExisting();
    flushMicrotasks();

    expect(backendService.addUnit).toHaveBeenCalledWith(5, {
      ...createUnit,
      createFrom: 11,
      createFromKey: 'U11'
    });
    expect(updateUnitListSpy).toHaveBeenCalledWith(123);
  }));
});

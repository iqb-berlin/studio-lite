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
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { DeleteUnitButtonComponent } from './delete-unit-button.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';

describe('DeleteUnitButtonComponent', () => {
  let component: DeleteUnitButtonComponent;
  let fixture: ComponentFixture<DeleteUnitButtonComponent>;

  let backendService: {
    deleteUnits: jest.Mock<Observable<boolean>, [number, number[]]>;
  };
  let snackBar: { open: jest.Mock<void, [string, string, { duration: number }]> };
  let translateService: TranslateService;
  let appService: { dataLoading: boolean };
  let workspaceService: { selectedWorkspaceId: number };
  let router: Router;
  let route: ActivatedRoute;
  let dialog: { open: jest.Mock<{ afterClosed: () => Observable<boolean> }> };

  beforeEach(async () => {
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(true) })) };
    backendService = {
      deleteUnits: jest.fn<Observable<boolean>, [number, number[]]>(() => of(true))
    };
    snackBar = { open: jest.fn() };
    appService = { dataLoading: false };
    workspaceService = { selectedWorkspaceId: 3 };
    router = { navigate: jest.fn(), routerState: { snapshot: { url: '' } } } as unknown as Router;
    route = { parent: {}, root: {} } as unknown as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [
        DeleteUnitButtonComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: WorkspaceBackendService, useValue: backendService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: AppService, useValue: appService },
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route }
      ]
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => (
      Array.isArray(key) ? key.join(',') : key
    ));

    fixture = TestBed.createComponent(DeleteUnitButtonComponent);
    component = fixture.componentInstance;
    component.selectedUnitId = 1;
    component.disabled = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deletes selected units when confirmed', fakeAsync(() => {
    const deleteUnitDialogSpy = jest.spyOn(
      component as unknown as { deleteUnitDialog: () => Promise<number[] | boolean> },
      'deleteUnitDialog'
    );
    deleteUnitDialogSpy.mockResolvedValue([4, 5]);
    const updateUnitListSpy = jest.spyOn(component, 'updateUnitList').mockImplementation(() => {});

    component.deleteUnit();
    flushMicrotasks();

    expect(backendService.deleteUnits).toHaveBeenCalledWith(3, [4, 5]);
    expect(snackBar.open).toHaveBeenCalledWith('workspace.unit-deleted', '', { duration: 1000 });
    expect(updateUnitListSpy).toHaveBeenCalled();
  }));

  it('shows an error snackbar when deletion fails', fakeAsync(() => {
    backendService.deleteUnits.mockReturnValueOnce(of(false));
    const deleteUnitDialogSpy = jest.spyOn(
      component as unknown as { deleteUnitDialog: () => Promise<number[] | boolean> },
      'deleteUnitDialog'
    );
    deleteUnitDialogSpy.mockResolvedValue([6]);

    component.deleteUnit();
    flushMicrotasks();

    expect(snackBar.open).toHaveBeenCalledWith(
      'workspace.unit-not-deleted',
      'workspace.error',
      { duration: 3000 }
    );
    expect(appService.dataLoading).toBe(false);
  }));
});

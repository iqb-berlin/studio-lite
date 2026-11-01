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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NEVER, Observable, of } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CreateUnitDto, RequestReportDto, UnitInListDto } from '@studio-lite-lib/api-dto';
import { AddUnitButtonComponent } from './add-unit-button.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';
import { NewUnitComponent } from '../new-unit/new-unit.component';
import { SelectUnitComponent } from '../select-unit/select-unit.component';

describe('AddUnitButtonComponent', () => {
  let component: AddUnitButtonComponent;
  let fixture: ComponentFixture<AddUnitButtonComponent>;

  let backendService: {
    addUnit: jest.Mock<Observable<number | boolean>, [number, CreateUnitDto]>;
    uploadUnits: jest.Mock<Observable<number | RequestReportDto>, [number, FileList]>;
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
  let dialog: DeepMocked<MatDialog>;

  beforeEach(async () => {
    backendService = {
      addUnit: jest.fn<Observable<number | boolean>, [number, CreateUnitDto]>(() => of(123)),
      uploadUnits: jest.fn<Observable<number | RequestReportDto>, [number, FileList]>(() => NEVER)
    };
    dialog = createMock<MatDialog>();
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
        { provide: ActivatedRoute, useValue: route },
        { provide: MatDialog, useValue: dialog }
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

  it('shows the saved new group for one second', fakeAsync(() => {
    const createUnit: CreateUnitDto = {
      key: 'U3',
      name: 'Unit 3',
      groupName: 'G2'
    };
    const addUnitDialogSpy = jest.spyOn(
      component as unknown as { addUnitDialog: (data: unknown) => Promise<CreateUnitDto | boolean> },
      'addUnitDialog'
    );
    addUnitDialogSpy.mockResolvedValue(createUnit);
    jest.spyOn(component, 'updateUnitList').mockImplementation(() => {});

    component.addUnit();
    flushMicrotasks();

    expect(appBackendService.setWorkspaceSettings).toHaveBeenCalledWith(5, workspaceService.workspaceSettings);
    expect(snackBar.open).toHaveBeenCalledWith('workspace.group-saved', '', { duration: 1000 });
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

  describe('through the dialogs', () => {
    // The dialog results reach the backend call through native async/await, which fakeAsync cannot
    // flush (the specs compile to es2020); a macrotask runs only after every pending promise callback.
    const settle = (): Promise<void> => new Promise(resolve => { setTimeout(resolve); });

    const newUnitForm = (groupDirect: string, groupSelect: string): UntypedFormGroup => new UntypedFormGroup({
      key: new UntypedFormControl(' U1 '),
      label: new UntypedFormControl('Unit 1'),
      groupDirect: new UntypedFormControl(groupDirect),
      groupSelect: new UntypedFormControl(groupSelect)
    });
    const newUnitDialogClosingWith = (result: UntypedFormGroup | boolean | undefined) => (
      createMock<MatDialogRef<NewUnitComponent>>({ afterClosed: () => of(result) })
    );
    const selectUnitDialogClosingWith = (
      result: boolean | undefined, selectedUnitIds: number[], selectedUnitName = 'Unit 11'
    ) => createMock<MatDialogRef<SelectUnitComponent>>({
      afterClosed: () => of(result),
      componentInstance: createMock<SelectUnitComponent>({
        selectedUnitIds, selectedUnitKey: 'U11', selectedUnitName
      })
    });

    beforeEach(() => {
      jest.mocked(router.navigate).mockResolvedValue(true);
      jest.spyOn(component, 'updateUnitList').mockImplementation(() => {});
    });

    // Not with both fields filled: which one counts then is #2015.
    it.each([
      ['the group typed in', 'Neu', '', 'Neu'],
      ['the group selected', '', 'G1', 'G1'],
      ['no group when none was chosen', '', '', '']
    ])('should file the new unit under %s', async (_, groupDirect, groupSelect, groupName) => {
      dialog.open.mockReturnValue(newUnitDialogClosingWith(newUnitForm(groupDirect, groupSelect)));

      component.addUnit();
      await settle();

      expect(backendService.addUnit).toHaveBeenCalledWith(5, expect.objectContaining({
        key: 'U1', name: 'Unit 1', groupName
      }));
    });

    it.each<[string, boolean, UntypedFormGroup | boolean | undefined]>([
      ['the open unit cannot be left', false, newUnitForm('', 'G1')],
      ['the dialog is dismissed', true, undefined],
      ['the dialog is cancelled', true, false]
    ])('should create no unit when %s', async (_, routingOk, result) => {
      jest.mocked(router.navigate).mockResolvedValue(routingOk);
      dialog.open.mockReturnValue(newUnitDialogClosingWith(result));

      component.addUnit();
      await settle();

      expect(dialog.open).toHaveBeenCalledTimes(routingOk ? 1 : 0);
      expect(backendService.addUnit).not.toHaveBeenCalled();
      expect(appService.dataLoading).toBe(false);
    });

    it.each([
      ['Unit 11', 'workspace.copy-from U11 - Unit 11'],
      ['', 'workspace.copy-from U11']
    ])('should offer the copy of the chosen unit named %p as %p', async (name, subTitle) => {
      dialog.open
        .mockReturnValueOnce(selectUnitDialogClosingWith(true, [11], name))
        .mockReturnValueOnce(newUnitDialogClosingWith(newUnitForm('', 'G1')));

      component.addUnitFromExisting();
      await settle();

      expect(dialog.open).toHaveBeenLastCalledWith(NewUnitComponent, expect.objectContaining({
        data: expect.objectContaining({ subTitle, key: 'U11', label: name })
      }));
      expect(backendService.addUnit).toHaveBeenCalledWith(5, expect.objectContaining({
        createFrom: 11, createFromKey: 'U11'
      }));
    });

    it('should offer no unit to copy when the open unit cannot be left', async () => {
      jest.mocked(router.navigate).mockResolvedValue(false);

      component.addUnitFromExisting();
      await settle();

      expect(dialog.open).not.toHaveBeenCalled();
    });

    it.each<[string, boolean | undefined, number[]]>([
      ['the selection is dismissed', undefined, [11]],
      ['the selection is cancelled', false, [11]],
      ['no unit is selected', true, []],
      ['two units are selected', true, [11, 12]]
    ])('should ask for no new unit when %s', async (_, result, selectedUnitIds) => {
      dialog.open.mockReturnValue(selectUnitDialogClosingWith(result, selectedUnitIds));

      component.addUnitFromExisting();
      await settle();

      expect(dialog.open).not.toHaveBeenCalledWith(NewUnitComponent, expect.anything());
      expect(backendService.addUnit).not.toHaveBeenCalled();
    });

    it('should copy no unit when the new unit dialog is cancelled', async () => {
      dialog.open
        .mockReturnValueOnce(selectUnitDialogClosingWith(true, [11]))
        .mockReturnValueOnce(newUnitDialogClosingWith(false));

      component.addUnitFromExisting();
      await settle();

      expect(dialog.open).toHaveBeenLastCalledWith(NewUnitComponent, expect.anything());
      expect(backendService.addUnit).not.toHaveBeenCalled();
      expect(appService.dataLoading).toBe(false);
    });

    it('should neither save the new group nor reload the list when copying a unit fails', async () => {
      backendService.addUnit.mockReturnValue(of(false));
      dialog.open
        .mockReturnValueOnce(selectUnitDialogClosingWith(true, [11]))
        .mockReturnValueOnce(newUnitDialogClosingWith(newUnitForm('G2', '')));

      component.addUnitFromExisting();
      await settle();

      expect(snackBar.open).toHaveBeenCalledWith('workspace.unit-not-added', 'workspace.error', { duration: 3000 });
      expect(appBackendService.setWorkspaceSettings).not.toHaveBeenCalled();
      expect(component.updateUnitList).not.toHaveBeenCalled();
    });
  });

  it('should upload the chosen files', () => {
    const files = createMock<FileList>({ length: 1 });

    component.onFileSelected(createMock<HTMLInputElement>({ files }));

    expect(backendService.uploadUnits).toHaveBeenCalledWith(5, files);
    expect(appService.dataLoading).toBe(true);
  });

  // The same file chosen again raised no change, so a failed upload could not be retried with it (#1994)
  it('should clear the choice once the upload has the files, so the same file can be chosen again', () => {
    const input = createMock<HTMLInputElement>({ files: createMock<FileList>({ length: 1 }), value: 'units.zip' });
    backendService.uploadUnits.mockReturnValue(of(-1));

    component.onFileSelected(input);

    expect(input.value).toBe('');
    expect(appService.dataLoading).toBe(false);
  });

  it('should upload nothing when the file selection is empty', () => {
    component.onFileSelected(createMock<HTMLInputElement>({ files: createMock<FileList>({ length: 0 }) }));

    expect(backendService.uploadUnits).not.toHaveBeenCalled();
    expect(appService.dataLoading).toBe(false);
  });
});

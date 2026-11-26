import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import { AuthDataDto, UnitInListDto, WorkspaceGroupDto } from '@studio-lite-lib/api-dto';
import { UnitActionsComponent } from './unit-actions.component';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { AppService } from '../../../../services/app.service';
import { ChangeResultService } from '../../../../services/change-result.service';
import { SelectTargetWorkspaceData } from '../select-target-workspace/select-target-workspace.component';

describe('UnitActionsComponent', () => {
  let fixture: ComponentFixture<UnitActionsComponent>;
  let component: UnitActionsComponent;
  let accessLevel: number;
  let otherWorkspaces: WorkspaceGroupDto['workspaces'];
  let dropBoxName: WritableSignal<string | undefined>;
  let unit: UnitInListDto;
  let changed: WritableSignal<boolean>;
  let authDataChanged: Subject<AuthDataDto>;
  let backend: {
    submitUnits: jest.Mock;
    returnSubmittedUnits: jest.Mock;
    copyUnits: jest.Mock;
    moveUnits: jest.Mock;
    deleteUnits: jest.Mock;
    getUnitGroups: jest.Mock;
    getUnitList: jest.Mock;
  };

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const button = (action: string) => element()
    .querySelector<HTMLButtonElement>(`[data-cy="unit-actions-${action}"]`);
  const text = (name: string) => element().querySelector(`[data-cy="unit-actions-${name}"]`)?.textContent?.trim();

  const create = () => {
    TestBed.configureTestingModule({
      imports: [UnitActionsComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        {
          provide: WorkspaceService,
          useValue: {
            selectedWorkspaceId: 1,
            selectedUnit$: new BehaviorSubject(5),
            userAccessLevel$: new BehaviorSubject(accessLevel),
            units: signal({ '': [unit] }).asReadonly(),
            dropBoxId: 9,
            dropBoxName: dropBoxName.asReadonly()
          }
        },
        {
          provide: AppService,
          useValue: {
            authData: {
              workspaces: [{
                id: 1,
                name: 'Mathe',
                isAdmin: false,
                workspaces: [{ id: 1, name: 'Hier', userAccessLevel: 4 }, ...otherWorkspaces]
              }]
            },
            authDataChanged
          }
        },
        { provide: WorkspaceBackendService, useValue: backend },
        { provide: UnitStoresService, useValue: { changed: changed.asReadonly() } },
        { provide: ChangeResultService, useValue: { show: jest.fn() } }
      ]
    });
    fixture = TestBed.createComponent(UnitActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jest.spyOn(TestBed.inject(MatSnackBar), 'open').mockImplementation();
  };

  // what a dialog answers when it is closed: the confirming button, or Esc and a click beside it (#1844)
  const dialogAnswers = (answer: unknown) => jest.spyOn(TestBed.inject(MatDialog), 'open')
    .mockReturnValue(createMock<MatDialogRef<unknown>>({ afterClosed: () => of(answer) }));

  beforeEach(() => {
    accessLevel = 4;
    otherWorkspaces = [{ id: 7, name: 'Dort', userAccessLevel: 4 }];
    dropBoxName = signal('Abgabe');
    unit = { id: 5, key: 'M6_AK01', name: 'Zahlen' };
    changed = signal(false);
    authDataChanged = new Subject<AuthDataDto>();
    backend = {
      submitUnits: jest.fn(() => of({ messages: [] })),
      returnSubmittedUnits: jest.fn(() => of({ messages: [] })),
      copyUnits: jest.fn(() => of({ messages: [] })),
      moveUnits: jest.fn(() => of({ messages: [] })),
      deleteUnits: jest.fn(() => of(true)),
      // the list is read again after a change
      getUnitGroups: jest.fn(() => of([])),
      getUnitList: jest.fn(() => of([unit]))
    };
  });

  // the thresholds of the menu, the list and the server: commenting submits and returns, the admin deletes and
  // moves, and copying and moving need another workspace in which the user is admin (#2232)
  it.each<[number, boolean, string[]]>([
    [1, false, ['submit', 'return']],
    [2, true, ['submit', 'return', 'copy']],
    [4, true, ['submit', 'return', 'copy', 'move', 'delete']],
    [4, false, ['submit', 'return', 'delete']]
  ])('offers at level %s, with a target %s: %s', (level, withTarget, offered) => {
    accessLevel = level;
    if (!withTarget) otherWorkspaces = [{ id: 7, name: 'Dort', userAccessLevel: 2 }];
    create();

    expect(['submit', 'return', 'copy', 'move', 'delete'].filter(action => !!button(action))).toEqual(offered);
  });

  // opened on a unit, the page may show the card before it knows the workspaces of the user
  it('offers copying once the workspaces of the user arrive', () => {
    otherWorkspaces = [];
    create();
    expect(button('copy')).toBeNull();

    authDataChanged.next(createMock<AuthDataDto>({
      workspaces: [{
        id: 1, name: 'Mathe', isAdmin: false, workspaces: [{ id: 7, name: 'Dort', userAccessLevel: 4 }]
      }]
    }));
    fixture.detectChanges();

    expect(button('copy')).not.toBeNull();
  });

  it('is not shown where nothing can be done', () => {
    accessLevel = 0;
    otherWorkspaces = [];
    create();

    expect(element().querySelector('[data-cy="unit-actions"]')).toBeNull();
  });

  it('names the drop box, and offers to submit only where there is one', () => {
    create();

    expect(button('submit')?.disabled).toBe(false);
    expect(text('drop-box')).toBe('unit-actions.drop-box');
    expect(component.dropBoxLine()).toEqual({ key: 'unit-actions.drop-box', params: { name: 'Abgabe' } });

    dropBoxName.set(undefined);
    fixture.detectChanges();

    expect(button('submit')?.disabled).toBe(true);
    expect(text('drop-box')).toBe('workspace.no-dropbox-defined');
  });

  it.each<[Partial<UnitInListDto>, boolean, { key: string; params?: Record<string, string> }]>([
    [{ sourceWorkspaceId: 3, sourceWorkspaceName: 'Mathe 6' }, true,
      { key: 'unit-actions.submitted-from', params: { name: 'Mathe 6' } }],
    [{ sourceWorkspaceId: 3 }, true, { key: 'unit-actions.submitted-from', params: { name: 'workspace.unknown' } }],
    [{ sourceWorkspaceId: 3, returned: true }, false, { key: 'unit-actions.not-submitted-here' }],
    [{}, false, { key: 'unit-actions.not-submitted-here' }]
  ])('offers to return a unit submitted here and names where from: %j', (submission, returnable, line) => {
    unit = { ...unit, ...submission };
    create();

    expect(button('return')?.disabled).toBe(!returnable);
    expect(component.sourceLine()).toEqual(line);
  });

  // Leaving the unit first lets the guard ask about unsaved changes; staying, nothing is sent.
  // Not fakeAsync: the view awaits the routing natively, which fakeAsync cannot flush. The view
  // awaits the same promise as the test, and first, so it has gone on once the test goes on.
  describe.each<['submitUnit' | 'returnUnit' | 'deleteUnit', keyof typeof backend, unknown[]]>([
    ['submitUnit', 'submitUnits', [1, 9, [5]]],
    ['returnUnit', 'returnSubmittedUnits', [1, [5]]],
    ['deleteUnit', 'deleteUnits', [1, [5]]]
  ])('%s', (action, sentWith, args) => {
    it.each<[boolean | undefined, boolean, boolean]>([
      [true, true, true],
      [true, false, false],
      [undefined, true, false],
      [false, true, false]
    ])('confirmed %s, unit left %s → sent %s', async (confirmed, left, sent) => {
      create();
      dialogAnswers(confirmed);
      const leaving = Promise.resolve(left);
      const selectUnit = jest.spyOn(component, 'selectUnit').mockReturnValue(leaving);

      component[action]();
      await leaving;

      expect(selectUnit.mock.calls).toEqual(confirmed === true ? [[0]] : []);
      expect(backend[sentWith].mock.calls).toEqual(sent ? [args] : []);
    });
  });

  it('asks about this unit and its drop box before submitting it', () => {
    create();
    const open = dialogAnswers(undefined);

    component.submitUnit();

    expect(open.mock.calls[0][1]?.data).toEqual(expect.objectContaining({ content: 'unit-actions.submit-confirm' }));
  });

  describe('copying', () => {
    it('copies this unit only, to the workspace chosen, without leaving it', () => {
      create();
      const open = dialogAnswers({ targetWorkspaceId: 7, copyComments: false });
      const selectUnit = jest.spyOn(component, 'selectUnit');

      component.copyUnit();

      expect((open.mock.calls[0][1]?.data as SelectTargetWorkspaceData).workspaces)
        .toEqual([{
          id: 7, name: 'Dort', groupId: 1, groupName: 'Mathe'
        }]);
      expect(backend.copyUnits).toHaveBeenCalledWith(7, [5], false);
      expect(selectUnit).not.toHaveBeenCalled();
    });

    it('copies nothing when the dialog is closed otherwise (#1844)', () => {
      create();
      dialogAnswers(undefined);

      component.copyUnit();

      expect(backend.copyUnits).not.toHaveBeenCalled();
    });

    it('says that unsaved changes stay behind', () => {
      create();
      const open = dialogAnswers(undefined);
      changed.set(true);

      component.copyUnit();

      expect((open.mock.calls[0][1]?.data as SelectTargetWorkspaceData).hints)
        .toEqual(['unit-actions.copy-saved-state']);
    });
  });

  describe('moving', () => {
    it.each<[unknown, boolean, boolean]>([
      [{ targetWorkspaceId: 7, copyComments: false }, true, true],
      [{ targetWorkspaceId: 7, copyComments: false }, false, false],
      [undefined, true, false]
    ])('chosen %j, unit left %s → sent %s', async (result, left, sent) => {
      create();
      dialogAnswers(result);
      const leaving = Promise.resolve(left);
      jest.spyOn(component, 'selectUnit').mockReturnValue(leaving);

      component.moveUnit();
      await leaving;

      expect(backend.moveUnits.mock.calls).toEqual(sent ? [[1, [5], 7]] : []);
    });

    it('says that a submitted unit can no longer be returned once moved', () => {
      unit = { ...unit, sourceWorkspaceId: 3 };
      create();
      const open = dialogAnswers(undefined);

      component.moveUnit();

      expect((open.mock.calls[0][1]?.data as SelectTargetWorkspaceData).hints)
        .toEqual(['workspace.unit-dropbox-history-deleted']);
    });
  });
});

// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, fakeAsync, flush, TestBed
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import { UnitPropertiesDto, WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { UnitPropertiesStore } from '../../classes/unit-properties-store';
import { ModuleService } from '../../../../services/module.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { I18nService } from '../../../../services/i18n.service';
import { VeronaModuleClass } from '../../../../models/verona-module.class';
import { UnitPropertiesComponent } from './unit-properties.component';
import { environment } from '../../../../../environments/environment';
import { NewGroupButtonComponent } from '../new-group-button/new-group-button.component';
import { SelectModuleComponent } from '../../../../components/select-module/select-module.component';
import { UnitCheckComponent } from '../unit-check/unit-check.component';

describe('UnitPropertiesComponent', () => {
  let component: UnitPropertiesComponent;
  let fixture: ComponentFixture<UnitPropertiesComponent>;

  @Component({ selector: 'studio-lite-new-group-button', template: '', standalone: true })
  class MockNewGroupButtonComponent {
    @Input() disabled!: boolean;
  }

  @Component({ selector: 'studio-lite-select-module', template: '', standalone: true })
  class MockSelectModuleComponent {
    @Input() modules!: { [key: string]: VeronaModuleClass };
    @Input() hidden!: boolean;
    @Input() stableOnly!: boolean;
    // what the view reads and hears of the real one once a unit is open
    value = '';
    @Output() selectionChanged = new EventEmitter<string>();
  }

  @Component({ selector: 'studio-lite-unit-check', template: '', standalone: true })
  class MockUnitCheckComponent {}

  beforeEach(async () => {
    const workspaceServiceStub = {
      selectedUnit$: new BehaviorSubject<number>(0),
      selectedWorkspaceId: 1,
      dropBoxId: 1,
      workspaceSettings: {
        defaultEditor: '',
        defaultPlayer: '',
        defaultSchemer: '',
        unitGroups: [],
        states: [],
        stableModulesOnly: true
      } as WorkspaceSettingsDto,
      loadUnitProperties: () => of(null),
      isValidFormKey: new BehaviorSubject<boolean>(true),
      setUnitKeyRefused: jest.fn()
    } as unknown as WorkspaceService;

    const moduleServiceStub = {
      editors: {},
      players: {},
      schemers: {},
      loadList: jest.fn().mockResolvedValue(undefined)
    } as unknown as ModuleService;

    const backendServiceStub = {
      getUnitScheme: jest.fn().mockReturnValue(of(null)),
      getUnitDefinition: jest.fn().mockReturnValue(of({ definition: 'def', variables: [] }))
    } as unknown as WorkspaceBackendService;

    await TestBed.configureTestingModule({
      imports: [
        UnitPropertiesComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: WorkspaceService, useValue: workspaceServiceStub },
        { provide: ModuleService, useValue: moduleServiceStub },
        { provide: WorkspaceBackendService, useValue: backendServiceStub },
        { provide: I18nService, useValue: {} },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .overrideComponent(UnitPropertiesComponent, {
        remove: { imports: [NewGroupButtonComponent, SelectModuleComponent, UnitCheckComponent] },
        add: { imports: [MockNewGroupButtonComponent, MockSelectModuleComponent, MockUnitCheckComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the unit check (#2135)', () => {
    expect(fixture.debugElement.query(By.directive(MockUnitCheckComponent))).toBeTruthy();
  });

  it('clears deprecated properties when requested', () => {
    component.unitForm.get('transcript')?.setValue('old');
    component.unitForm.get('reference')?.setValue('old');

    component.deleteDeprecatedProperty('transcript');
    component.deleteDeprecatedProperty('reference');

    expect(component.unitForm.get('transcript')?.value).toBe('');
    expect(component.unitForm.get('reference')?.value).toBe('');
  });

  // #1842: a taken key blocks saving once it is a change; a unit already carrying one stays editable
  it.each([
    [true, true, true],
    [false, true, false],
    [true, false, false]
  ])('reports the key as refused: changed %s, carried by another unit %s → %s', (changed, carried, refused) => {
    const store = createMock<UnitPropertiesStore>();
    store.getChangedData.mockReturnValue(changed ? { id: 1, key: 'FIRST1' } : { id: 1 });
    jest.spyOn(component.unitStores, 'propertiesStore').mockReturnValue(store);
    component.unitForm.patchValue({ key: 'FIRST1' }, { emitEvent: false });
    component.unitForm.get('key')?.setErrors(carried ? { keyNotUnique: 'taken' } : null);

    (component as unknown as { reportUnitKeyRefused(): void }).reportUnitKeyRefused();

    expect(component.workspaceService.setUnitKeyRefused).toHaveBeenCalledWith(refused);
  });

  describe('with a unit open', () => {
    const unitData = (data: Partial<UnitPropertiesDto> = {}): UnitPropertiesDto => ({
      id: 5,
      key: 'KEY1',
      name: 'Name',
      description: 'Text',
      groupName: 'G1',
      state: '2',
      transcript: 'Transcript',
      reference: 'Reference',
      ...data
    });

    // opens the unit as the workspace does: select it, then read its properties from its store
    const openUnit = (data: UnitPropertiesDto, loaded = true): UnitPropertiesStore => {
      const store = new UnitPropertiesStore(data, loaded);
      jest.spyOn(component.unitStores, 'propertiesStore').mockReturnValue(store);
      component.workspaceService.selectedUnit$.next(data.id);
      flush();
      return store;
    };

    beforeEach(() => {
      // with the module list there, the properties are read without waiting for it
      component.moduleService.editors = { 'editor@1.0': createMock<VeronaModuleClass>() };
      component.workspaceService.unitList = {};
      component.workspaceService.states = [{ id: 2, label: 'Done', color: 'red' }];
    });

    it('lets the properties be edited and hands each changed field to the unit\'s store', fakeAsync(() => {
      const store = openUnit(unitData());

      component.unitForm.patchValue({
        key: 'KEY2',
        name: 'New name',
        description: 'New text',
        group: 'G2',
        transcript: 'New transcript',
        reference: 'New reference',
        state: '3'
      });

      expect(component.unitForm.enabled).toBe(true);
      expect(store.getChangedData()).toEqual({
        id: 5,
        key: 'KEY2',
        name: 'New name',
        description: 'New text',
        groupName: 'G2',
        transcript: 'New transcript',
        reference: 'New reference',
        state: '3'
      });
    }));

    // A key stored before the rules applied shows its error at once, not only once it is touched.
    // The view is opened with a unit, so the form is enabled when the key of the next one is checked.
    it('shows the error of a loaded key that breaks the rules at once', fakeAsync(() => {
      openUnit(unitData({ key: 'KEY1' }));
      openUnit(unitData({ id: 6, key: 'ab' }));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('mat-error')).not.toBeNull();
    }));

    // #2120: the database column holds 20 characters, and saving a longer key failed as a server problem
    it('blocks saving a key longer than 20 characters', fakeAsync(() => {
      openUnit(unitData({ key: 'KEY1' }));

      component.unitForm.patchValue({ key: 'K'.repeat(20) });
      expect(component.workspaceService.setUnitKeyRefused).toHaveBeenLastCalledWith(false);

      component.unitForm.patchValue({ key: 'K'.repeat(21) });
      expect(component.workspaceService.setUnitKeyRefused).toHaveBeenLastCalledWith(true);
    }));

    // #2127: the dialog on leaving the unit saves what the save button saves, and an empty key was
    // blocked there only because it blocked every key that broke a rule
    it('blocks saving an emptied key, but not one that only breaks the format rules', fakeAsync(() => {
      openUnit(unitData({ key: 'KEY1' }));

      component.unitForm.patchValue({ key: '1K' });
      expect(component.workspaceService.setUnitKeyRefused).toHaveBeenLastCalledWith(false);

      component.unitForm.patchValue({ key: '' });
      expect(component.workspaceService.setUnitKeyRefused).toHaveBeenLastCalledWith(true);

      component.unitForm.patchValue({ key: '   ' });
      expect(component.workspaceService.setUnitKeyRefused).toHaveBeenLastCalledWith(true);
    }));

    // #2004: the store of a unit the server did not answer for holds its id alone, and the form went
    // on showing the unit before
    it('shows no unit, but says so, when the properties of the unit could not be loaded', fakeAsync(() => {
      const notLoadedHint = () => fixture.nativeElement.querySelector('[data-cy="unit-properties-not-loaded"]');
      openUnit(unitData());

      openUnit({ id: 6 }, false);
      fixture.detectChanges();

      expect(component.unitForm.disabled).toBe(true);
      expect(component.unitForm.getRawValue()).toEqual({
        key: '', name: '', description: '', state: '', group: '', transcript: '', reference: ''
      });
      expect(notLoadedHint()).not.toBeNull();

      openUnit(unitData({ id: 7 }));
      fixture.detectChanges();

      expect(component.unitForm.enabled).toBe(true);
      expect(notLoadedHint()).toBeNull();
    }));

    it.each([
      ['2', 'red'],
      ['9', '']
    ])('marks the unit in state %s with the colour of that state: \'%s\'', fakeAsync((
      state: string, colour: string
    ) => {
      openUnit(unitData({ state }));

      expect(component.selectedStateColor).toBe(colour);
    }));

    it('takes the colour of the state chosen', fakeAsync(() => {
      openUnit(unitData({ state: '9' }));

      component.unitForm.patchValue({ state: '2' });
      const chosen = component.selectedStateColor;
      component.unitForm.patchValue({ state: '9' });

      expect([chosen, component.selectedStateColor]).toEqual(['red', '']);
    }));

    // Leaving the unit first lets the guard ask about unsaved changes; staying, nothing is sent.
    // Esc, a click beside the dialog and navigation close it with undefined (#1844).
    // Not fakeAsync: the view awaits the routing natively, which fakeAsync cannot flush. The view
    // awaits the same promise as the test, and first, so it has gone on once the test goes on.
    type UnitAction = 'submitUnit' | 'returnSubmittedUnit';
    const sentBy: Record<UnitAction, ['submitUnits' | 'returnSubmittedUnits', unknown[]]> = {
      submitUnit: ['submitUnits', [1, 1, [5]]],
      returnSubmittedUnit: ['returnSubmittedUnits', [1, [5]]]
    };
    it.each<[UnitAction, boolean | undefined, boolean, boolean]>([
      ['submitUnit', true, true, true],
      ['submitUnit', true, false, false],
      ['submitUnit', undefined, true, false],
      ['returnSubmittedUnit', true, true, true],
      ['returnSubmittedUnit', true, false, false],
      ['returnSubmittedUnit', undefined, true, false]
    ])('%s: confirmed %s, unit left %s → sent %s', async (action, confirmed, left, sent) => {
      component.workspaceService.selectedUnit$.next(5);
      jest.spyOn(TestBed.inject(MatDialog), 'open')
        .mockReturnValue(createMock<MatDialogRef<unknown>>({ afterClosed: () => of(confirmed) }));
      const leaving = Promise.resolve(left);
      const selectUnit = jest.spyOn(component, 'selectUnit').mockReturnValue(leaving);
      jest.spyOn(component.snackBar, 'open').mockImplementation();
      const [method, args] = sentBy[action];
      const send = jest.fn().mockReturnValue(of(false));
      component.backendService[method] = send;

      component[action]();
      await leaving;

      expect(selectUnit.mock.calls).toEqual(confirmed ? [[0]] : []);
      expect(send.mock.calls).toEqual(sent ? [args] : []);
    });
  });
});

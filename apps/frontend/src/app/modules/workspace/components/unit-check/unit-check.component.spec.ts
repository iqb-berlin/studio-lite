import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { UnitCheckComponent } from './unit-check.component';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { ModuleService } from '../../../../services/module.service';
import { BackendService as CommentsBackendService } from '../../../comments/services/backend.service';

const scheme = (variableCodings: unknown[]): string => JSON.stringify({ version: '3.0', variableCodings });

// a code, so that the schemer finds nothing missing in a coding
const code = {
  id: 1,
  type: 'FULL_CREDIT',
  label: '',
  score: 1,
  ruleSetOperatorAnd: false,
  manualInstruction: '',
  ruleSets: [{ ruleOperatorAnd: false, rules: [{ method: 'IS_EMPTY' }] }]
};

describe('UnitCheckComponent', () => {
  let fixture: ComponentFixture<UnitCheckComponent>;
  let unitStores: UnitStoresService;
  let hiddenRoutes: string[];
  let getUnitRichNotes: jest.Mock;
  let getUnitDefinition: jest.Mock;
  let getUnitDefinitionSummary: jest.Mock;
  let getUnitScheme: jest.Mock;
  let hasComments: jest.Mock;
  let units: WritableSignal<{ [group: string]: UnitInListDto[] }>;
  let listLoaded: WritableSignal<boolean>;
  let listVersion: WritableSignal<number>;
  let editors: Record<string, { nameAndVersion: string }>;
  let loadList: jest.Mock;

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const tabs = () => Array.from(
    element().querySelectorAll('[data-cy^="unit-check-"].section'),
    section => section.getAttribute('data-cy')
  );
  const sectionOf = (tab: string) => element().querySelector(`[data-cy="unit-check-${tab}"]`);

  const create = () => {
    TestBed.configureTestingModule({
      imports: [UnitCheckComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: WorkspaceService,
          useValue: {
            selectedUnit$: new BehaviorSubject(3),
            selectedWorkspaceId: 1,
            units: units.asReadonly(),
            workspaceSettings: { hiddenRoutes }
          }
        },
        {
          provide: WorkspaceBackendService,
          useValue: {
            getUnitProperties: () => of({
              id: 3,
              key: 'UNIT_03',
              editor: 'iqb-editor-aspect@2.9',
              player: 'iqb-player-aspect@2.9',
              schemer: 'iqb-schemer@2.5'
            }),
            getUnitDefinition,
            getUnitDefinitionSummary,
            getUnitScheme,
            getUnitRichNotes
          }
        },
        {
          provide: ModuleService,
          useValue: {
            editors,
            players: { 'iqb-player-aspect@2.9': { nameAndVersion: 'Player' } },
            schemers: { 'iqb-schemer@2.5': { nameAndVersion: 'Schemer' } },
            listLoaded: listLoaded.asReadonly(),
            listVersion: listVersion.asReadonly(),
            loadList
          }
        }
      ]
    }).overrideComponent(UnitCheckComponent, {
      set: {
        providers: [{
          provide: CommentsBackendService,
          useValue: { hasComments }
        }]
      }
    });
    unitStores = TestBed.inject(UnitStoresService);
    fixture = TestBed.createComponent(UnitCheckComponent);
    fixture.detectChanges();
  };

  beforeEach(() => {
    hiddenRoutes = [];
    listLoaded = signal(true);
    listVersion = signal(1);
    editors = { 'iqb-editor-aspect@2.9': { nameAndVersion: 'Editor' } };
    loadList = jest.fn().mockResolvedValue(undefined);
    units = signal({ '': [{ id: 4, key: 'UNIT_04' }] });
    hasComments = jest.fn(() => of(true));
    getUnitRichNotes = jest.fn(() => of({ tags: [], notes: [] }));
    getUnitDefinition = jest.fn(() => of({ definition: '{}', variables: [{ id: '05', alias: '_00a' }] }));
    getUnitDefinitionSummary = jest.fn(() => of({ hasDefinition: true }));
    // the variables come with the scheme, as the schemer is given them
    getUnitScheme = jest.fn(() => of({
      scheme: scheme([]), schemeType: 'iqb-standard@3.0', variables: [{ id: '05', alias: '_00a' }]
    }));
  });

  it('shows every tab of a complete unit as in order, comments and notes as information', fakeAsync(() => {
    create();

    expect(tabs()).toEqual([
      'unit-check-properties', 'unit-check-editor', 'unit-check-schemer', 'unit-check-comments', 'unit-check-notes'
    ]);
    expect(sectionOf('schemer')?.querySelector('[data-cy="unit-check-ok"]')).toBeTruthy();
    expect(sectionOf('comments')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
      .toBe('unit-check.comments-present');
    expect(sectionOf('notes')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
      .toBe('unit-check.notes-absent');
  }));

  it('leaves out the comments and notes the workspace hides', fakeAsync(() => {
    hiddenRoutes = ['comments', 'notes'];
    create();

    expect(tabs()).toEqual(['unit-check-properties', 'unit-check-editor', 'unit-check-schemer']);
    expect(hasComments).not.toHaveBeenCalled();
    expect(getUnitRichNotes).not.toHaveBeenCalled();
  }));

  // the export writes the ids of a scheme whether the coding is shown or not (#2119)
  it('shows an id the export would write twice under the properties when the coding is hidden', fakeAsync(() => {
    hiddenRoutes = ['editor', 'schemer'];
    getUnitScheme.mockReturnValue(of({
      scheme: scheme([{ id: 'd_1', alias: '05', sourceType: 'MANUAL' }]),
      schemeType: 'iqb-standard@3.0',
      variables: [{ id: '05', alias: '_00a' }]
    }));
    create();

    expect(tabs()).toEqual(['unit-check-properties', 'unit-check-comments', 'unit-check-notes']);
    expect(getUnitScheme).toHaveBeenCalled();
    const properties = sectionOf('properties');
    expect(properties?.querySelector('[data-cy="unit-check-variable-id-conflicts"]')).toBeTruthy();
    // its steps lead into the tabs this workspace hides
    expect(properties?.querySelector('[data-cy="variable-id-conflicts-manual-fix"]')).toBeNull();
    expect(properties?.querySelector('[data-cy="unit-check-fix-elsewhere"]')).toBeTruthy();
  }));

  // the definition embeds the unit's media; the check needs only whether there is one and its format (#2135)
  it('asks for a summary of the definition, not for the definition itself', fakeAsync(() => {
    create();

    expect(getUnitDefinitionSummary).toHaveBeenCalledWith(1, 3);
    expect(getUnitDefinition).not.toHaveBeenCalled();
    expect(sectionOf('editor')?.querySelector('[data-cy="unit-check-ok"]')).toBeTruthy();
  }));

  // the editor beside the properties holds the definition as it is being edited
  it('follows the definition the editor holds, unsaved changes included', fakeAsync(() => {
    create();
    unitStores.loadDefinitionStore(1, 3).subscribe();
    unitStores.definitionStore()?.setData([], '');
    fixture.detectChanges();

    expect(Array.from(
      sectionOf('editor')?.querySelectorAll('[data-cy="unit-check-finding"]') ?? [],
      finding => finding.textContent
    )).toEqual(['unit-check.no-definition']);
  }));

  // the card reads the unit as it is being edited, so a fix shows before it is saved (#2135)
  it('follows the scheme as the schemer reports it, saved or not', fakeAsync(() => {
    create();

    unitStores.schemeStore()?.setData(
      scheme([{ id: 'd_1', alias: '05', sourceType: 'MANUAL' }]),
      'iqb-standard@3.0'
    );
    fixture.detectChanges();
    expect(sectionOf('schemer')?.querySelector('[data-cy="unit-check-variable-id-conflicts"]')).toBeTruthy();

    unitStores.schemeStore()?.setData(
      scheme([{
        id: 'd_1', alias: 'sum', sourceType: 'COPY_VALUE', deriveSources: ['05'], codes: [code]
      }]),
      'iqb-standard@3.0'
    );
    fixture.detectChanges();
    expect(sectionOf('schemer')?.querySelector('[data-cy="unit-check-ok"]')).toBeTruthy();
  }));

  it('names a module the unit lost before it is saved', fakeAsync(() => {
    create();

    unitStores.metadataStore()?.setPlayer('');
    fixture.detectChanges();

    expect(Array.from(
      sectionOf('properties')?.querySelectorAll('[data-cy="unit-check-finding"]') ?? [],
      finding => finding.textContent
    )).toEqual(['unit-check.no-player']);
  }));

  // a key the form would not let through can come with an import; the card names it as typed (#2135)
  it('names a key the form would not accept under the properties', fakeAsync(() => {
    create();
    expect(sectionOf('properties')?.querySelector('[data-cy="unit-check-ok"]')).toBeTruthy();

    unitStores.metadataStore()?.setBasicData('00_INVALID_NAME', '', '', '', '', '', '');
    fixture.detectChanges();

    expect(Array.from(
      sectionOf('properties')?.querySelectorAll('[data-cy="unit-check-finding"]') ?? [],
      finding => finding.textContent
    )).toEqual(['unit-check.key-format']);
  }));

  // the list of units can arrive after the unit, when it is opened by its address (#1842)
  it('names a key another unit has once the list of units arrives', fakeAsync(() => {
    units.set({});
    create();
    expect(sectionOf('properties')?.querySelector('[data-cy="unit-check-ok"]')).toBeTruthy();

    units.set({ '': [{ id: 4, key: 'unit_03' }] });
    fixture.detectChanges();

    expect(Array.from(
      sectionOf('properties')?.querySelectorAll('[data-cy="unit-check-finding"]') ?? [],
      finding => finding.textContent
    )).toEqual(['unit-check.key-taken']);
  }));

  const propertyFindings = () => Array.from(
    sectionOf('properties')?.querySelectorAll('[data-cy="unit-check-finding"]') ?? [],
    finding => finding.textContent
  );

  // the request for the lists failed: that is no proof that the modules are missing (#2135)
  it('says the modules were not checked when their lists could not be loaded, not that they are missing',
    fakeAsync(() => {
      listLoaded.set(false);
      create();
      tick();
      fixture.detectChanges();

      expect(loadList).toHaveBeenCalled();
      expect(propertyFindings()).toEqual(['unit-check.modules-not-loaded']);
    }));

  // a reload, from the workspace, can bring a player installed since; the maps themselves are no signals
  it('checks the modules again when a reload of their lists replaces them', fakeAsync(() => {
    create();
    expect(propertyFindings()).toEqual([]);

    TestBed.inject(ModuleService).players = {};
    listVersion.set(2);
    fixture.detectChanges();

    expect(propertyFindings()).toEqual(['unit-check.not-installed-player']);
  }));

  // an installation without modules has empty lists, and they need not be fetched again
  it('loads lists that were loaded once, empty or not, no second time', fakeAsync(() => {
    editors = {};
    create();

    expect(loadList).not.toHaveBeenCalled();
  }));
});

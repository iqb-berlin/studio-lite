import {
  ComponentFixture, fakeAsync, flush, TestBed, tick
} from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { DEFAULT_UNIT_SIZE_LEVELS } from '@studio-lite/shared-code';
import { UnitCheckComponent } from './unit-check.component';
import * as unitCheckUtils from '../../utils/unit-check.utils';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { ModuleService } from '../../../../services/module.service';
import { BackendService as CommentsBackendService } from '../../../comments/services/backend.service';
import { InstalledDependenciesService } from '../../services/installed-dependencies.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { I18nService } from '../../../../services/i18n.service';
import { UnitLastChanges } from '../../models/unit-last-changes.interface';
import { ProfileNamesService } from '../../services/profile-names.service';
import { LanguageService } from '../../../../services/language.service';
import { MetadataProfileIds } from '../../utils/metadata-profiles.utils';

type UnitCheckSectionTab = unitCheckUtils.UnitCheckSection['tab'];

const GERMAN_UNIT = 'https://w3id.org/iqb/p12/unit/';
const MATH_UNIT = 'https://w3id.org/iqb/p11/unit/';

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
  let hiddenRoutesState: WritableSignal<string[]>;
  let settingsLoaded: boolean;
  let settingsLoadedState: WritableSignal<boolean>;
  let commentsUpdated: Subject<void>;
  let richNotesChanged: Subject<void>;
  let hasUnitRichNotes: jest.Mock;
  let getUnitDefinition: jest.Mock;
  let getUnitDefinitionSummary: jest.Mock;
  let getUnitScheme: jest.Mock;
  let hasComments: jest.Mock;
  let units: WritableSignal<{ [group: string]: UnitInListDto[] }>;
  let listLoaded: WritableSignal<boolean>;
  let listVersion: WritableSignal<number>;
  let editors: Record<string, { nameAndVersion: string }>;
  let loadList: jest.Mock;
  let loadInstalledDependencies: jest.Mock;
  let getUnitValidation: jest.Mock;
  let lastChanges: WritableSignal<UnitLastChanges>;
  let getUnitMetadata: jest.Mock;
  let metadataProfileIds: WritableSignal<MetadataProfileIds>;

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const tabs = () => Array.from(
    element().querySelectorAll('[data-cy^="unit-check-"].section'),
    section => section.getAttribute('data-cy')
  );
  const sectionOf = (tab: string) => element().querySelector(`[data-cy="unit-check-${tab}"]`);

  const create = () => {
    hiddenRoutesState = signal(hiddenRoutes);
    settingsLoadedState = signal(settingsLoaded);
    commentsUpdated = new Subject<void>();
    richNotesChanged = new Subject<void>();
    TestBed.configureTestingModule({
      imports: [UnitCheckComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: WorkspaceService,
          useValue: {
            selectedUnit$: new BehaviorSubject(3),
            selectedWorkspaceId: 1,
            units: units.asReadonly(),
            hiddenRoutes: hiddenRoutesState.asReadonly(),
            settingsLoaded: settingsLoadedState.asReadonly(),
            onCommentsUpdated: commentsUpdated,
            richNotesChanged$: richNotesChanged,
            lastChanges: lastChanges.asReadonly(),
            metadataProfileIds: metadataProfileIds.asReadonly()
          }
        },
        { provide: ProfileNamesService, useValue: { labels: signal({}).asReadonly(), request: jest.fn() } },
        { provide: LanguageService, useValue: { active: { code: 'de' } } },
        { provide: I18nService, useValue: { fullLocale: 'en-US', dateTimeFormat: 'dd.MM.yyyy HH:mm' } },
        { provide: AppBackendService, useValue: { getUnitValidation } },
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
            getUnitMetadata,
            hasUnitRichNotes
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
        providers: [
          { provide: CommentsBackendService, useValue: { hasComments } },
          { provide: InstalledDependenciesService, useValue: { load: loadInstalledDependencies } }
        ]
      }
    });
    unitStores = TestBed.inject(UnitStoresService);
    fixture = TestBed.createComponent(UnitCheckComponent);
    fixture.detectChanges();
  };

  beforeEach(() => {
    hiddenRoutes = [];
    settingsLoaded = true;
    listLoaded = signal(true);
    listVersion = signal(1);
    editors = { 'iqb-editor-aspect@2.9': { nameAndVersion: 'Editor' } };
    loadList = jest.fn().mockResolvedValue(undefined);
    loadInstalledDependencies = jest.fn(() => of({ packages: ['GeoGebra'], widgets: [] }));
    getUnitValidation = jest.fn(() => of({ sizeLevels: DEFAULT_UNIT_SIZE_LEVELS }));
    units = signal({ '': [{ id: 4, key: 'UNIT_04' }] });
    lastChanges = signal({});
    metadataProfileIds = signal({ unit: GERMAN_UNIT });
    getUnitMetadata = jest.fn(() => of({ profiles: [] }));
    hasComments = jest.fn(() => of(true));
    hasUnitRichNotes = jest.fn(() => of(false));
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
      'unit-check-properties', 'unit-check-metadata', 'unit-check-editor', 'unit-check-schemer',
      'unit-check-comments', 'unit-check-notes'
    ]);
    expect(sectionOf('schemer')?.querySelector('[data-cy="unit-check-ok"]')).toBeTruthy();
    expect(sectionOf('comments')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
      .toBe('unit-check.comments-present');
    expect(sectionOf('notes')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
      .toBe('unit-check.notes-absent');
  }));

  describe('an information unit', () => {
    const textElement = (alias: string) => ({ id: 'text_x', alias, type: 'no-value' });

    it('says there is nothing to code', fakeAsync(() => {
      getUnitScheme.mockReturnValue(of({ scheme: '', schemeType: '', variables: [textElement('text_1')] }));
      create();

      expect(sectionOf('schemer')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
        .toBe('unit-check.nothing-to-code');
    }));

    // two elements of one internal id are written twice all the same: no information beside the warning
    it('says nothing of it beside an id written twice', fakeAsync(() => {
      getUnitScheme.mockReturnValue(of({
        scheme: '', schemeType: '', variables: [textElement('text_1'), textElement('text_2')]
      }));
      create();

      expect(sectionOf('schemer')?.querySelector('[data-cy="unit-check-info"]')).toBeNull();
      expect(sectionOf('schemer')?.querySelector('[data-cy="unit-check-variable-id-conflicts"]')).toBeTruthy();
    }));
  });

  it('leaves out the comments and notes the workspace hides', fakeAsync(() => {
    hiddenRoutes = ['comments', 'notes'];
    create();

    expect(tabs())
      .toEqual(['unit-check-properties', 'unit-check-metadata', 'unit-check-editor', 'unit-check-schemer']);
    expect(hasComments).not.toHaveBeenCalled();
    expect(hasUnitRichNotes).not.toHaveBeenCalled();
  }));

  // after a reload of the page and on entering a workspace, its settings arrive after the unit (#2135)
  it('waits for the settings of the workspace, and asks for no tab they hide', fakeAsync(() => {
    settingsLoaded = false;
    create();
    expect(tabs()).toEqual([]);

    hiddenRoutesState.set(['comments', 'notes']);
    settingsLoadedState.set(true);
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    expect(tabs())
      .toEqual(['unit-check-properties', 'unit-check-metadata', 'unit-check-editor', 'unit-check-schemer']);
    expect(hasComments).not.toHaveBeenCalled();
    expect(hasUnitRichNotes).not.toHaveBeenCalled();
  }));

  // a change in the settings dialog: what is known of the other tab still holds
  it('asks nothing again, and keeps the card, when a tab is only hidden', fakeAsync(() => {
    create();

    hiddenRoutesState.set(['notes']);
    fixture.detectChanges();

    expect(tabs()).toEqual([
      'unit-check-properties', 'unit-check-metadata', 'unit-check-editor', 'unit-check-schemer', 'unit-check-comments'
    ]);
    expect(hasComments).toHaveBeenCalledTimes(1);
    expect(hasUnitRichNotes).toHaveBeenCalledTimes(1);
  }));

  it('asks whether there are comments once the settings show their tab', fakeAsync(() => {
    hiddenRoutes = ['comments'];
    create();
    expect(hasComments).not.toHaveBeenCalled();

    hiddenRoutesState.set([]);
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    expect(hasComments).toHaveBeenCalledWith(1, 3);
    expect(sectionOf('comments')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
      .toBe('unit-check.comments-present');
  }));

  // a comment written in the comments tab pinned beside the properties (#2135)
  it('asks again whether there are comments when they change, also after another tab was hidden', fakeAsync(() => {
    const commentsInfo = () => sectionOf('comments')?.querySelector('[data-cy="unit-check-info"]')?.textContent;
    hasComments.mockReturnValue(of(false));
    create();
    expect(commentsInfo()).toBe('unit-check.comments-absent');

    hasComments.mockReturnValue(of(true));
    commentsUpdated.next();
    fixture.detectChanges();
    expect(commentsInfo()).toBe('unit-check.comments-present');

    hiddenRoutesState.set(['notes']);
    fixture.detectChanges();
    hasComments.mockReturnValue(of(false));
    commentsUpdated.next();
    fixture.detectChanges();
    expect(commentsInfo()).toBe('unit-check.comments-absent');
  }));

  // a note added in the tab pinned beside the properties (#2135)
  it('asks again whether there are notes when they change', fakeAsync(() => {
    create();
    expect(sectionOf('notes')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
      .toBe('unit-check.notes-absent');

    hasUnitRichNotes.mockReturnValue(of(true));
    richNotesChanged.next();
    fixture.detectChanges();

    expect(sectionOf('notes')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
      .toBe('unit-check.notes-present');
  }));

  // the first answer is slow and was sent before the comment was written: it must not have the last word
  it('takes the answer to the newest question about comments', fakeAsync(() => {
    const commentsInfo = () => sectionOf('comments')?.querySelector('[data-cy="unit-check-info"]')?.textContent;
    const slowFirstAnswer = new Subject<boolean>();
    hasComments.mockReturnValue(slowFirstAnswer);
    create();

    hasComments.mockReturnValue(of(true));
    commentsUpdated.next();
    slowFirstAnswer.next(false);
    slowFirstAnswer.complete();
    fixture.detectChanges();

    expect(commentsInfo()).toBe('unit-check.comments-present');
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

    expect(tabs())
      .toEqual(['unit-check-properties', 'unit-check-metadata', 'unit-check-comments', 'unit-check-notes']);
    expect(getUnitScheme).toHaveBeenCalled();
    const properties = sectionOf('properties');
    expect(properties?.querySelector('[data-cy="unit-check-variable-id-conflicts"]')).toBeTruthy();
    // its steps lead into the tabs this workspace hides
    expect(properties?.querySelector('[data-cy="variable-id-conflicts-manual-fix"]')).toBeNull();
    expect(properties?.querySelector('[data-cy="unit-check-fix-elsewhere"]')?.textContent)
      .toBe('unit-check.fix-elsewhere');
  }));

  it('names only the coding as hidden when the editor is shown', fakeAsync(() => {
    hiddenRoutes = ['schemer'];
    getUnitScheme.mockReturnValue(of({
      scheme: scheme([{ id: 'd_1', alias: '05', sourceType: 'MANUAL' }]),
      schemeType: 'iqb-standard@3.0',
      variables: [{ id: '05', alias: '_00a' }]
    }));
    create();

    expect(sectionOf('properties')?.querySelector('[data-cy="unit-check-fix-elsewhere"]')?.textContent)
      .toBe('unit-check.fix-elsewhere-coding');
  }));

  // values kept from a profile the workspace assigned before, to be known (#2235)
  it('shows the metadata after the properties, as information while values of another profile are kept',
    fakeAsync(() => {
      const mathValue = {
        profileId: MATH_UNIT,
        entries: [{ id: 'iqb_author', label: [], valueAsText: [{ lang: 'de', value: 'Elsa Mignon' }] }]
      };
      getUnitMetadata.mockReturnValue(of({ profiles: [mathValue] }));
      create();
      const metadata = () => fixture.componentInstance.sections()?.find(entry => entry.tab === 'metadata');

      expect(tabs().slice(0, 2)).toEqual(['unit-check-properties', 'unit-check-metadata']);
      expect(sectionOf('metadata')?.querySelector('.info-icon')).toBeTruthy();
      expect(metadata()?.metadataProfiles?.unit).toEqual({ assigned: GERMAN_UNIT, unused: [{ profileId: MATH_UNIT }] });
      expect(sectionOf('metadata')?.querySelector('[data-cy="unit-check-metadata-profiles"]')).toBeTruthy();

      // as they are edited: another profile assigned, or the values gone
      metadataProfileIds.set({ unit: MATH_UNIT });
      fixture.detectChanges();
      expect(metadata()?.status).toBe('ok');
      metadataProfileIds.set({ unit: GERMAN_UNIT });
      unitStores.metadataStore()?.setMetadata({ profiles: [] });
      fixture.detectChanges();
      expect(metadata()?.status).toBe('ok');
    }));

  // the defaults a workspace is entered with hide no tab: asked only once its settings say it shows them
  it('asks for the metadata only once the settings show their tab', fakeAsync(() => {
    settingsLoaded = false;
    create();
    expect(getUnitMetadata).not.toHaveBeenCalled();

    hiddenRoutesState.set(['metadata']);
    settingsLoadedState.set(true);
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    expect(getUnitMetadata).not.toHaveBeenCalled();
    expect(tabs()).not.toContain('unit-check-metadata');
  }));

  // every keystroke in the metadata forms changes them; the other sections stay as they are
  it('builds only the metadata section anew when the metadata are edited', fakeAsync(() => {
    // with a size, the editor's section is a new object whenever the sections are built
    getUnitDefinitionSummary.mockReturnValue(of({ hasDefinition: true, size: 1024 }));
    create();
    const before = fixture.componentInstance.sections();

    unitStores.metadataStore()?.setMetadata({ profiles: [], items: [{ id: 'ITEM_1' }] });
    fixture.detectChanges();
    const after = fixture.componentInstance.sections();

    expect(after).not.toBe(before);
    after?.filter(entry => entry.tab !== 'metadata')
      .forEach(entry => expect(entry).toBe(before?.find(earlier => earlier.tab === entry.tab)));
  }));

  it('says so where the metadata were not delivered', fakeAsync(() => {
    getUnitMetadata.mockReturnValue(of(null));
    create();

    expect(sectionOf('metadata')?.querySelector('[data-cy="unit-check-info"]')?.textContent)
      .toBe('unit-check.not-loaded');
  }));

  it('leaves the metadata out where the workspace hides their tab, and asks for them once it shows it',
    fakeAsync(() => {
      hiddenRoutes = ['metadata'];
      create();

      expect(tabs()).not.toContain('unit-check-metadata');
      expect(getUnitMetadata).not.toHaveBeenCalled();

      hiddenRoutesState.set([]);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(getUnitMetadata).toHaveBeenCalledWith(1, 3);
      expect(tabs()).toContain('unit-check-metadata');
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
      sectionOf('editor')?.querySelectorAll('[data-cy="unit-check-finding-text"]') ?? [],
      finding => finding.textContent
    )).toEqual(['unit-check.no-definition']);
  }));

  // the server counts the stored definition; once the editor holds one, the card counts that, as it is typed (#2197)
  it('shows the size of the stored definition, then of the one in the editor, unsaved changes included',
    fakeAsync(() => {
      getUnitDefinitionSummary.mockReturnValue(of({ hasDefinition: true, size: 300 * 1024 }));
      create();
      const definitionSize = () => fixture.componentInstance.sections()
        ?.find(entry => entry.tab === 'editor')?.definitionSize;

      expect(sectionOf('editor')?.querySelector('[data-cy="unit-check-definition-size"]')?.textContent)
        .toBe('unit-check.definition-size.medium');
      expect(definitionSize()?.params).toEqual({ size: '300.0 KB' });

      unitStores.loadDefinitionStore(1, 3).subscribe();
      unitStores.definitionStore()?.setData([], 'Größe');
      fixture.detectChanges();

      expect(definitionSize()).toEqual({ key: 'unit-check.definition-size.small', params: { size: '7.0 B' } });
    }));

  // the levels begin where an administrator set them; read once while the card is shown (#2229)
  it('names the level of the size by the levels set, and asks for them once', fakeAsync(() => {
    getUnitValidation.mockReturnValue(of({ sizeLevels: { mediumFromKb: 10, largeFromKb: 100, veryLargeFromKb: 200 } }));
    getUnitDefinitionSummary.mockReturnValue(of({ hasDefinition: true, size: 150 * 1024 }));
    create();

    expect(sectionOf('editor')?.querySelector('[data-cy="unit-check-definition-size"]')?.textContent)
      .toBe('unit-check.definition-size.large');

    TestBed.inject(WorkspaceService).selectedUnit$.next(4);
    fixture.detectChanges();
    expect(getUnitValidation).toHaveBeenCalledTimes(1);
  }));

  // the defaults might name it otherwise than the levels set; the next unit asks again (#2229)
  it('shows the size without a level where the levels could not be read', fakeAsync(() => {
    getUnitValidation.mockReturnValue(of(null));
    getUnitDefinitionSummary.mockReturnValue(of({ hasDefinition: true, size: 150 * 1024 }));
    create();

    expect(sectionOf('editor')?.querySelector('[data-cy="unit-check-definition-size"]')?.textContent)
      .toBe('unit-check.definition-size.no-level');

    TestBed.inject(WorkspaceService).selectedUnit$.next(4);
    fixture.detectChanges();
    expect(getUnitValidation).toHaveBeenCalledTimes(2);
  }));

  // where the properties showed it before, now as soon as the part is saved (#2232)
  it('shows when the definition was last changed, and by whom, under the editor', fakeAsync(() => {
    create();
    const lastChangeOf = (tab: UnitCheckSectionTab) => fixture.componentInstance.sections()
      ?.find(entry => entry.tab === tab)?.lastChanges;

    expect(sectionOf('editor')?.querySelector('[data-cy="unit-check-last-change"]')).toBeNull();

    lastChanges.set({ definition: { at: new Date(2026, 10, 26, 10, 15) }, metadata: { at: new Date(2026, 0, 2) } });
    fixture.detectChanges();

    expect(sectionOf('editor')?.querySelector('[data-cy="unit-check-last-change"]')?.textContent)
      .toBe('unit-check.last-changed-definition');
    expect(lastChangeOf('editor')).toEqual([{
      key: 'unit-check.last-changed-definition', params: { date: '26.11.2026 10:15', user: 'workspace.unknown' }
    }]);
    expect(lastChangeOf('properties')?.[0].key).toBe('unit-check.last-changed-metadata');
  }));

  // what the stored unit needs comes with the summary; once the editor holds the definition, what it reports (#2198)
  it('lists what the stored unit needs, then what the editor reports, unsaved changes included', fakeAsync(() => {
    getUnitDefinitionSummary.mockReturnValue(of({
      hasDefinition: true,
      dependenciesToPlay: [{ id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' }],
      dependenciesToEdit: []
    }));
    create();
    const entries = (purpose: string) => Array.from(
      sectionOf('editor')
        ?.querySelectorAll(`[data-cy="unit-check-dependencies-${purpose}"] [data-cy="unit-check-dependency"]`) ?? [],
      entry => entry.textContent
    );

    expect(loadInstalledDependencies).toHaveBeenCalledWith(1);
    expect(entries('play')).toEqual(['unit-check.dependency.package-installed']);
    expect(sectionOf('editor')?.querySelector('[data-cy="unit-check-dependencies-edit"]')?.textContent?.trim())
      .toBe('unit-check.dependencies-edit-none');

    unitStores.loadDefinitionStore(1, 3).subscribe();
    unitStores.definitionStore()?.setData([], '{}', undefined, {
      toPlay: [{ id: 'GeoGebra.itcr.zip', type: 'FILE_TO_UNPACK' }],
      toEdit: [{ id: 'PERIODIC_TABLE', type: 'WIDGET' }]
    });
    fixture.detectChanges();

    expect(entries('edit')).toEqual(['unit-check.dependency.widget-missing']);
    expect(Array.from(
      sectionOf('editor')?.querySelectorAll('[data-cy="unit-check-finding-text"]') ?? [],
      finding => finding.textContent
    )).toEqual(['unit-check.dependencies-missing-to-edit-widgets', 'workspace.dependencies-missing-install-hint']);
  }));

  // the editor reports with every keystroke in a text; the check parses and validates the scheme (#2135)
  it('checks again when the editor changes the variables, not when it changes only the text', fakeAsync(() => {
    create();
    unitStores.loadDefinitionStore(1, 3).subscribe();
    fixture.detectChanges();
    const check = jest.spyOn(unitCheckUtils, 'checkUnit');

    unitStores.definitionStore()?.setData([{ id: '05', alias: '_00a' } as VariableInfo], '{"pages":["typed"]}');
    fixture.detectChanges();
    expect(check).not.toHaveBeenCalled();

    unitStores.definitionStore()?.setData([{ id: '05', alias: '_00b' } as VariableInfo], '{"pages":["typed"]}');
    fixture.detectChanges();
    expect(check).toHaveBeenCalledTimes(1);

    // the list was changed before already: only the comparison of the variables tells this change
    unitStores.definitionStore()?.setData([{ id: '05', alias: '_00c' } as VariableInfo], '{"pages":["typed"]}');
    fixture.detectChanges();
    expect(check).toHaveBeenCalledTimes(2);
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

  // what fails stands apart from what is only worth knowing, at the section and beside each finding (#2135)
  it('shows a section by its weightiest finding, and each finding with the sign of its level', fakeAsync(() => {
    create();
    const statusIcon = () => sectionOf('properties')?.querySelector('.status-icon')?.textContent?.trim();

    unitStores.propertiesStore()?.setEditor('');
    fixture.detectChanges();
    expect(statusIcon()).toBe('info');

    unitStores.propertiesStore()?.setPlayer('');
    fixture.detectChanges();
    expect(statusIcon()).toBe('error');
    expect(Array.from(
      sectionOf('properties')?.querySelectorAll('[data-cy="unit-check-finding"]') ?? [],
      finding => [finding.getAttribute('data-level'), finding.querySelector('.finding-icon')?.textContent?.trim()]
    )).toEqual([['hint', 'info'], ['error', 'error']]);
    // the sign alone tells the level: a screen reader names it
    expect(sectionOf('properties')?.querySelector('.status-icon')?.getAttribute('aria-label'))
      .toBe('unit-check.level.error');
    expect(Array.from(
      sectionOf('properties')?.querySelectorAll('.finding-icon') ?? [],
      icon => [icon.getAttribute('aria-hidden'), icon.getAttribute('aria-label')]
    )).toEqual([['false', 'unit-check.level.hint'], ['false', 'unit-check.level.error']]);
  }));

  it('names a module the unit lost before it is saved', fakeAsync(() => {
    create();

    unitStores.propertiesStore()?.setPlayer('');
    fixture.detectChanges();

    expect(Array.from(
      sectionOf('properties')?.querySelectorAll('[data-cy="unit-check-finding-text"]') ?? [],
      finding => finding.textContent
    )).toEqual(['unit-check.no-player']);
  }));

  // a key the form would not let through can come with an import; the card names it as typed (#2135)
  it('names a key the form would not accept under the properties', fakeAsync(() => {
    create();
    expect(sectionOf('properties')?.querySelector('[data-cy="unit-check-ok"]')).toBeTruthy();

    unitStores.propertiesStore()?.setBasicData('00_INVALID_NAME', '', '', '', '', '', '');
    fixture.detectChanges();

    expect(Array.from(
      sectionOf('properties')?.querySelectorAll('[data-cy="unit-check-finding-text"]') ?? [],
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
      sectionOf('properties')?.querySelectorAll('[data-cy="unit-check-finding-text"]') ?? [],
      finding => finding.textContent
    )).toEqual(['unit-check.key-taken']);
  }));

  const propertyFindings = () => Array.from(
    sectionOf('properties')?.querySelectorAll('[data-cy="unit-check-finding-text"]') ?? [],
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

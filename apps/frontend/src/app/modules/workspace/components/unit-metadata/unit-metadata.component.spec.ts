// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, fakeAsync, flush, TestBed
} from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output, signal, WritableSignal
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject, Observable, of, Subject
} from 'rxjs';
import { MetadataProfileDto, UnitMetadataValues, WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { MDProfile } from '@iqbspecs/metadata-profile';
import { ProfileFormComponent } from '@iqb/metadata-components';
import { UnitMetadataComponent } from './unit-metadata.component';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { MetadataBackendService } from '../../../metadata/services/metadata-backend.service';
import { MetadataService } from '../../../metadata/services/metadata.service';
import { LanguageService } from '../../../../services/language.service';
import { ItemsComponent } from '../../../metadata/components/items/items.component';
import { AliasId } from '../../../metadata/models/alias-id.interface';

@Component({ selector: 'iqb-profile-form', template: '', standalone: true })
class MockProfileFormComponent {
  @Input() metadataValues: unknown;
  @Input() profileData: unknown;
  @Input() language!: string;
  @Input() formlyWrapper!: string;
  @Input() panelExpanded!: boolean;
  @Input() vocabularyProvider: unknown;
  @Output() metadataChange = new EventEmitter<unknown>();
}

@Component({ selector: 'studio-lite-items', template: '', standalone: true })
class MockItemsComponent {
  @Input() profile: unknown;
  @Input() metadata: unknown;
  @Input() language!: string;
  @Input() variablesLoader!: BehaviorSubject<AliasId[]>;
  @Output() metadataChange = new EventEmitter<UnitMetadataValues>();
}

describe('UnitMetadataComponent', () => {
  let fixture: ComponentFixture<UnitMetadataComponent>;
  let component: UnitMetadataComponent;
  let unitStores: UnitStoresService;
  let selectedUnit$: BehaviorSubject<number>;
  let unitMetadataReloaded: Subject<void>;
  let workspaceSettings: WorkspaceSettingsDto;
  let settingsLoaded: WritableSignal<boolean>;
  // the metadata the server answers with, per unit; a Subject holds the answer back
  let metadataOf: Record<number, UnitMetadataValues | Subject<UnitMetadataValues>>;
  let schemeThere: boolean;
  // a scheme held back for a unit, where one is
  let pendingSchemeOf: Record<number, Subject<{ scheme: string; schemeType: string }>>;

  const metadata = (profileId: string): UnitMetadataValues => ({
    profiles: [{ profileId, entries: [] }], items: [{ id: `item of ${profileId}` }]
  });

  /** Selects a unit as the workspace does: the stores of the unit left are let go of first. */
  const select = (unitId: number) => {
    unitStores.reset();
    selectedUnit$.next(unitId);
  };

  const create = () => {
    TestBed.configureTestingModule({
      imports: [UnitMetadataComponent, TranslateModule.forRoot()],
      providers: [
        UnitStoresService,
        {
          provide: WorkspaceService,
          useValue: {
            selectedUnit$, selectedWorkspaceId: 1, workspaceSettings, settingsLoaded, unitMetadataReloaded
          }
        },
        {
          provide: WorkspaceBackendService,
          useValue: {
            getUnitMetadata: (_: number, unitId: number): Observable<UnitMetadataValues | null> => {
              const answer = metadataOf[unitId];
              if (answer instanceof Subject) return answer;
              return of(answer ?? null);
            },
            getUnitScheme: (_: number, unitId: number) => pendingSchemeOf[unitId] ??
              of(schemeThere ? { scheme: '{}', schemeType: '' } : null),
            getUnitDefinition: () => of({ definition: 'def', variables: [] })
          }
        },
        { provide: MetadataBackendService, useValue: { getMetadataProfile: jest.fn(() => of({})) } },
        { provide: MetadataService, useValue: { loadProfileVocabularies: jest.fn().mockResolvedValue(undefined) } },
        { provide: LanguageService, useValue: { active: { code: 'de' } } }
      ]
    }).overrideComponent(UnitMetadataComponent, {
      remove: { imports: [ProfileFormComponent, ItemsComponent] },
      add: { imports: [MockProfileFormComponent, MockItemsComponent] }
    });
    unitStores = TestBed.inject(UnitStoresService);
    fixture = TestBed.createComponent(UnitMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    selectedUnit$ = new BehaviorSubject(3);
    unitMetadataReloaded = new Subject<void>();
    workspaceSettings = {
      defaultEditor: '', defaultPlayer: '', defaultSchemer: '', unitGroups: [], stableModulesOnly: true
    };
    settingsLoaded = signal(true);
    metadataOf = { 3: metadata('of-3'), 4: metadata('of-4') };
    schemeThere = true;
    pendingSchemeOf = {};
  });

  it('merges changed profiles into the store while preserving items', fakeAsync(() => {
    create();
    flush();

    component.onMetadataChange({ profiles: [{ profileId: 'new' }] } as unknown as Parameters<
    typeof component.onMetadataChange>[0]);

    expect(unitStores.metadataStore()?.getData()).toEqual({
      profiles: [{ profileId: 'new' }], items: [{ id: 'item of of-3' }]
    });
  }));

  it('merges changed items into the store while preserving profiles', fakeAsync(() => {
    create();
    flush();

    component.onItemsMetadataChange({ profiles: [], items: [{ id: 'new' }] });

    expect(unitStores.metadataStore()?.getData()).toEqual({
      profiles: [{ profileId: 'of-3', entries: [] }], items: [{ id: 'new' }]
    });
  }));

  it('does not clobber stored profiles when a change carries no profiles slice', fakeAsync(() => {
    create();
    flush();

    component.onMetadataChange({} as unknown as Parameters<typeof component.onMetadataChange>[0]);

    expect(unitStores.metadataStore()?.getData()).toEqual(metadata('of-3'));
  }));

  // #1830: the items created by a save have their uuids only as the save answered
  it('builds the forms anew from the store after a save created items', fakeAsync(() => {
    create();
    flush();
    const stored = { items: [{ id: 'item1', uuid: 'uuid-1' }] };
    unitStores.metadataStore()?.applySaved({}, stored);

    unitMetadataReloaded.next();

    expect(component.metadata).toEqual(stored);
    expect(component.metadata).not.toBe(stored);
  }));

  // without the scheme the list is empty, and an item would take that for its variable having gone
  it.each([
    ['there', true],
    ['not there', false]
  ])('hands the variables to the items only once the scheme is there: %s', fakeAsync((
    _: string, withScheme: boolean
  ) => {
    schemeThere = withScheme;
    create();
    const variables: AliasId[] = [{ id: 'text', alias: 'text' }];
    jest.spyOn(unitStores, 'variables').mockReturnValue(variables);
    select(3);
    flush();

    expect(component.variablesLoaded()).toBe(withScheme);
    expect(component.variablesLoader.getValue()).toEqual(withScheme ? variables : []);
  }));

  // the editor pinned beside the tab may load the definition only after it
  it('works out the item variables anew when a definition store loaded later changes', fakeAsync(() => {
    create();
    flush();
    const handedOn = jest.fn();
    component.variablesLoader.subscribe(handedOn);
    handedOn.mockClear();
    unitStores.loadDefinitionStore(1, 3).subscribe();
    TestBed.tick();

    unitStores.definitionStore()?.setData([], 'changed');

    expect(handedOn).toHaveBeenCalledTimes(1);
  }));

  type ProfileSetting = 'unitMDProfile' | 'itemMDProfile';
  type OfferedProfile = 'unitProfile' | 'itemProfile';
  it.each<[ProfileSetting, OfferedProfile]>([
    ['unitMDProfile', 'unitProfile'],
    ['itemMDProfile', 'itemProfile']
  ])('fetches the %s of the workspace once, and offers it once its vocabularies are there', fakeAsync((
    setting: ProfileSetting, offered: OfferedProfile
  ) => {
    // not a mock: of() would take a mock, which has every method, for a scheduler
    const profile: MetadataProfileDto = {
      id: 'profile', label: [], groups: [], modifiedAt: new Date()
    };
    workspaceSettings[setting] = 'https://profiles/unit.json';
    // opened without a unit, as the workspace opens: no profile is asked for before the first unit
    selectedUnit$.next(0);
    create();
    const getProfile = jest.mocked(TestBed.inject(MetadataBackendService).getMetadataProfile)
      .mockReturnValue(of(profile));
    let vocabulariesLoaded: (loaded: boolean) => void = () => {};
    jest.mocked(TestBed.inject(MetadataService).loadProfileVocabularies)
      .mockReturnValue(new Promise<boolean>(resolve => { vocabulariesLoaded = resolve; }));

    select(3);
    const offeredBefore = component[offered];
    vocabulariesLoaded(true);
    flush();
    select(4);
    flush();

    expect(getProfile.mock.calls).toEqual([['https://profiles/unit.json']]);
    expect(offeredBefore).toBeUndefined();
    expect(component[offered]).toBe(profile as unknown as MDProfile);
  }));

  // After a reload the stores may come before the workspace settings: the forms kept the defaults the
  // workspace is entered with, and showed no profile (#2223).
  it('builds the forms only once the workspace settings are loaded, with their profile', fakeAsync(() => {
    const profile: MetadataProfileDto = {
      id: 'profile', label: [], groups: [], modifiedAt: new Date()
    };
    settingsLoaded.set(false);
    create();
    const getProfile = jest.mocked(TestBed.inject(MetadataBackendService).getMetadataProfile)
      .mockReturnValue(of(profile));
    flush();
    const builtBefore = component.metadataLoaded();

    // as the workspace does: the stored settings replace the defaults, then they count as loaded
    TestBed.inject(WorkspaceService).workspaceSettings = {
      ...workspaceSettings, unitMDProfile: 'https://profiles/unit.json'
    };
    settingsLoaded.set(true);
    fixture.detectChanges();
    flush();

    expect(builtBefore).toBe(false);
    expect(getProfile.mock.calls).toEqual([['https://profiles/unit.json']]);
    expect(component.metadataLoaded()).toBe(true);
  }));

  it('says so when the metadata of the unit could not be loaded', fakeAsync(() => {
    delete metadataOf[3];
    create();
    flush();
    fixture.detectChanges();

    expect(component.notLoaded()).toBe(true);
    expect(fixture.nativeElement.querySelector('[data-cy="unit-metadata-not-loaded"]')).not.toBeNull();
  }));

  // Units are clicked through quickly: what comes late for the unit left must not reach the next (#2200).
  describe('when another unit is selected', () => {
    it('takes the forms away at once and builds them for the next unit only, its answer coming late', fakeAsync(() => {
      const lateAnswer = new Subject<UnitMetadataValues>();
      metadataOf[3] = lateAnswer;
      create();
      flush();

      select(4);
      flush();
      lateAnswer.next(metadata('of-3'));
      lateAnswer.complete();
      flush();

      expect(component.metadata).toEqual(metadata('of-4'));
      expect(unitStores.metadataStore()?.unitId).toBe(4);
      expect(unitStores.metadataStore()?.getData()).toEqual(metadata('of-4'));
    }));

    it('hides the forms while the metadata of the next unit are on their way', fakeAsync(() => {
      const pending = new Subject<UnitMetadataValues>();
      metadataOf[4] = pending;
      create();
      flush();
      expect(component.metadataLoaded()).toBe(true);

      select(4);
      flush();

      expect(component.metadataLoaded()).toBe(false);
    }));

    // the metadata of the next unit are there, its scheme is not yet: its forms are not built
    it('writes nothing the forms of the unit left report into the store of the next', fakeAsync(() => {
      pendingSchemeOf[4] = new Subject();
      create();
      flush();

      select(4);
      flush();
      component.onMetadataChange({ profiles: [{ profileId: 'typed for 3' }] } as unknown as Parameters<
      typeof component.onMetadataChange>[0]);
      component.onItemsMetadataChange({ items: [{ id: 'typed for 3' }] });

      expect(unitStores.metadataStore()?.unitId).toBe(4);
      expect(unitStores.metadataStore()?.changed()).toBe(false);
      expect(unitStores.metadataStore()?.getData()).toEqual(metadata('of-4'));
    }));
  });
});

import {
  Component, computed, inject, OnDestroy, OnInit, signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  combineLatest, distinctUntilChanged, EMPTY, filter, forkJoin, from, map, Observable, of, pairwise, shareReplay,
  startWith, Subject, switchMap, takeUntil, tap
} from 'rxjs';
import {
  MatCard, MatCardContent, MatCardHeader, MatCardTitle
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UnitDefinitionSummaryDto } from '@studio-lite-lib/api-dto';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { sameDependencyLists, sameVariableLists, UnitSizeLevels } from '@studio-lite/shared-code';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { ModuleService } from '../../../../services/module.service';
import { BackendService as CommentsBackendService } from '../../../comments/services/backend.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import {
  checkUnit, DefinitionContent, definitionSummary, isTabShown, LastChangeLines, ModuleType, UnitCheckFinding,
  UnitCheckSection, withDefinitionSize, withKeyFindings, withLastChanges, withMetadataProfiles
} from '../../utils/unit-check.utils';
import { MetadataProfiles, metadataProfiles } from '../../utils/metadata-profiles.utils';
import { MetadataProfilesComponent } from '../metadata-profiles/metadata-profiles.component';
import { LastChange } from '../../models/unit-last-changes.interface';
import { I18nService } from '../../../../services/i18n.service';
import { byteLength } from '../../utils/definition-size.utils';
import { checkUnitKey } from '../../utils/unit-key.utils';
import { InstalledDependencies } from '../../utils/missing-dependencies.utils';
import { InstalledDependenciesService } from '../../services/installed-dependencies.service';
import { VariableIdConflictListComponent } from '../variable-id-conflict-list/variable-id-conflict-list.component';
import { VariableIdConflictFixComponent } from '../variable-id-conflict-fix/variable-id-conflict-fix.component';

/** What the check reads from the server for the unit, apart from the stores. */
interface UnitCheckSources {
  /** The server's summary of the stored definition; not asked for where the editor holds it. */
  definitionSummary: UnitDefinitionSummaryDto | undefined;
  /** The packages and widgets the studio has (#2198); a list that could not be read is null. */
  installedDependencies: InstalledDependencies;
  /** Where the levels of a unit's size begin, as an administrator set them (#2229); null: not read. */
  sizeLevels: UnitSizeLevels | null;
}

/**
 * Whether the unit has comments and rich notes. Asked again when the tabs the workspace hides
 * change: its settings may arrive after the unit (#2135). undefined: hidden, or not known.
 */
interface Presence {
  hasComments: boolean | undefined;
  hasRichNotes: boolean | undefined;
}

/** What is asked for the presence: the unit, and which of the two tabs the workspace shows. */
interface PresenceQuery {
  unitId: number;
  comments: boolean;
  notes: boolean;
}

const sameQuery = (a: PresenceQuery, b: PresenceQuery): boolean => a.unitId === b.unitId &&
  a.comments === b.comments && a.notes === b.notes;

/** What the check reads of the definition the editor holds: not its text. */
interface EditorDefinition {
  summary: DefinitionContent;
  variables: VariableInfo[] | undefined;
}

const sameEditorDefinition = (a: EditorDefinition | undefined, b: EditorDefinition | undefined): boolean => a === b ||
  (!!a && !!b && a.summary.hasDefinition === b.summary.hasDefinition &&
    a.summary.definitionType === b.summary.definitionType && sameVariableLists(a.variables, b.variables) &&
    sameDependencyLists(a.summary.dependenciesToPlay, b.summary.dependenciesToPlay) &&
    sameDependencyLists(a.summary.dependenciesToEdit, b.summary.dependenciesToEdit));

type Modules = Partial<Record<ModuleType, string>>;
type UnitKey = { id: number; key: string | undefined };

const sameModules = (a: Modules | undefined, b: Modules | undefined): boolean => a === b || (!!a && !!b &&
  a.editor === b.editor && a.player === b.player && a.schemer === b.schemer);

/**
 * The state of the open unit, tab by tab, with what is to be done where something is missing
 * (#2135). It reads the unit as it is being edited, from the stores every tab writes into, so a
 * fix shows here before it is saved. Which questions are asked is {@link checkUnit}'s business.
 */
@Component({
  selector: 'studio-lite-unit-check',
  templateUrl: './unit-check.component.html',
  styleUrls: ['./unit-check.component.scss'],
  // the comment calls are provided where they are used, as the comments component does; what the
  // studio has of what units need is read once per workspace while the card is shown (#2198)
  providers: [CommentsBackendService, InstalledDependenciesService],
  imports: [
    MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatIcon, MatProgressSpinner, TranslateModule,
    VariableIdConflictListComponent, VariableIdConflictFixComponent, MetadataProfilesComponent
  ]
})
export class UnitCheckComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  // undefined until the stores, the modules and the sources of the unit shown are loaded
  private readonly sources = signal<UnitCheckSources | undefined>(undefined);
  // undefined until asked for the unit shown and the tabs the workspace hides
  private readonly presence = signal<Presence | undefined>(undefined);
  private readonly hiddenRoutes$: Observable<string[]>;
  private readonly settingsLoaded$: Observable<boolean>;

  // only the modules of the properties: the check, which parses the scheme, must not run again on
  // every keystroke in the name or the description
  private readonly modules = computed((): Modules | undefined => {
    const propertiesStore = this.unitStores.propertiesStore();
    if (!propertiesStore?.loaded) return undefined;
    const { editor, player, schemer } = propertiesStore.data();
    return { editor, player, schemer };
  }, { equal: sameModules });

  // the key as it is being typed, and only the key: a keystroke in the name changes nothing here
  private readonly unitKey = computed((): UnitKey | undefined => {
    const propertiesStore = this.unitStores.propertiesStore();
    if (!propertiesStore?.loaded) return undefined;
    const { id, key } = propertiesStore.data();
    return { id, key };
  }, { equal: (a, b) => a?.id === b?.id && a?.key === b?.key });

  // checked apart from the rest, so that a keystroke in the key does not parse the scheme again; the
  // list of units is read as a signal, as it may arrive after the unit (#1842)
  private readonly keyFindings = computed((): UnitCheckFinding[] => {
    const unitKey = this.unitKey();
    return unitKey ? checkUnitKey(unitKey.key, unitKey.id, this.workspaceService.units()) : [];
  });

  // what the check reads of the editor's definition, and only that: the editor reports with every
  // keystroke in a text, and the check, which parses and validates the scheme, must not run on each
  private readonly editorDefinition = computed((): EditorDefinition | undefined => {
    const data = this.unitStores.definitionStore()?.data();
    return data && { summary: definitionSummary(data), variables: data.variables };
  }, { equal: sameEditorDefinition });

  private readonly checked = computed((): UnitCheckSection[] | undefined => {
    const sources = this.sources();
    const presence = this.presence();
    if (!sources || !presence) return undefined;
    // the maps of installed modules are no signals: checked again when a reload replaces them
    this.moduleService.listVersion();
    const definitionStore = this.unitStores.definitionStore();
    const editorDefinition = this.editorDefinition();
    const schemeStore = this.unitStores.schemeStore();
    return checkUnit({
      modules: this.modules(),
      installed: this.moduleService.listLoaded() ?
        {
          editor: this.moduleService.editors,
          player: this.moduleService.players,
          schemer: this.moduleService.schemers
        } :
        undefined,
      installedDependencies: sources.installedDependencies,
      // the editor's definition where it is loaded, unsaved changes included; else the server's summary
      definition: editorDefinition ? editorDefinition.summary : sources.definitionSummary,
      // as the schemer is given them: an editor that never reported variables leaves them to the scheme
      variables: editorDefinition?.variables || schemeStore?.data().variables,
      scheme: schemeStore?.data(),
      unsaved: { variables: definitionStore?.variablesChanged() ?? false },
      ...presence,
      hiddenRoutes: this.workspaceService.hiddenRoutes()
    });
  });

  // apart from the check as well, which it does not change: counted again with every keystroke in the
  // editor. The editor's definition where it is loaded, unsaved changes included; else the stored one's (#2197).
  private readonly definitionSize = computed((): number | undefined => {
    const data = this.unitStores.definitionStore()?.data();
    return data ? byteLength(data.definition) : this.sources()?.definitionSummary?.size;
  });

  private readonly i18nService = inject(I18nService);
  private readonly appBackendService = inject(AppBackendService);
  private sizeLevels$?: Observable<UnitSizeLevels | null>;
  // as a signal: the language file may arrive after the first check
  private readonly unknownUser = toSignal(inject(TranslateService).stream('workspace.unknown'), { initialValue: '' });

  // who changed which part when, as the properties showed it before; renewed as soon as a part is saved (#2232)
  private readonly lastChangeLines = computed((): LastChangeLines => {
    const changes = this.workspaceService.lastChanges();
    const datePipe = new DatePipe(this.i18nService.fullLocale);
    const line = (key: string, change: LastChange | undefined): UnitCheckFinding | undefined => change && {
      key,
      params: {
        date: datePipe.transform(change.at, this.i18nService.dateTimeFormat) ?? '',
        user: change.user || this.unknownUser()
      }
    };
    return {
      metadata: line('unit-check.last-changed-metadata', changes.metadata),
      definition: line('unit-check.last-changed-definition', changes.definition),
      scheme: line('unit-check.last-changed-scheme', changes.scheme)
    };
  });

  // whether the server did not deliver the unit's metadata
  private readonly metadataNotLoaded = signal(false);

  // the profiles the workspace assigns, and those the unit keeps values of all the same (#2235): read off
  // the metadata as they are edited, and only once the settings say which profiles the workspace assigns.
  // undefined: not known yet; null: the metadata were not delivered.
  private readonly profileUse = computed((): MetadataProfiles | null | undefined => {
    if (!this.workspaceService.settingsLoaded()) return undefined;
    const store = this.unitStores.metadataStore();
    if (store) return metadataProfiles(store.data(), this.workspaceService.metadataProfileIds());
    return this.metadataNotLoaded() ? null : undefined;
  });

  // the sections but the metadata's: an edit of the metadata, with every keystroke in their forms, builds
  // only that one anew
  private readonly sectionsBesideMetadata = computed((): UnitCheckSection[] | undefined => {
    const checked = this.checked();
    return checked && withLastChanges(
      withDefinitionSize(
        withKeyFindings(checked, this.keyFindings()),
        this.definitionSize(),
        this.sources()?.sizeLevels ?? null
      ),
      this.lastChangeLines()
    );
  });

  readonly sections = computed((): UnitCheckSection[] | undefined => {
    const sections = this.sectionsBesideMetadata();
    return sections && withMetadataProfiles(sections, this.profileUse(), this.workspaceService.hiddenRoutes());
  });

  // Conflicts stand under the properties only where the coding is hidden; every way to resolve them
  // needs it, and most the editor as well -- which may be shown (#2135)
  readonly fixElsewhereKey = computed(() => (isTabShown(this.workspaceService.hiddenRoutes(), 'editor') ?
    'unit-check.fix-elsewhere-coding' :
    'unit-check.fix-elsewhere'));

  constructor(
    private workspaceService: WorkspaceService,
    private unitStores: UnitStoresService,
    private moduleService: ModuleService,
    private backendService: WorkspaceBackendService,
    private commentsBackendService: CommentsBackendService,
    private installedDependencies: InstalledDependenciesService
  ) {
    this.hiddenRoutes$ = toObservable(this.workspaceService.hiddenRoutes);
    this.settingsLoaded$ = toObservable(this.workspaceService.settingsLoaded);
  }

  ngOnInit(): void {
    this.workspaceService.selectedUnit$
      .pipe(
        switchMap(unitId => {
          this.sources.set(undefined);
          return this.load(unitId);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(sources => this.sources.set(sources));
    // apart from the rest, which a slow answer would hold up; the store is shared with the metadata tab. Not
    // asked for where the workspace hides the tab, and asked for once it shows it (#2235); as for the comments,
    // only once the settings are loaded: the defaults a workspace is entered with hide no tab (#2135)
    combineLatest([this.workspaceService.selectedUnit$, this.hiddenRoutes$, this.settingsLoaded$])
      .pipe(
        filter(([, , settingsLoaded]) => settingsLoaded),
        switchMap(([unitId, hiddenRoutes]) => {
          this.metadataNotLoaded.set(false);
          return unitId > 0 && isTabShown(hiddenRoutes, 'metadata') ?
            this.unitStores.loadMetadataStore(this.workspaceService.selectedWorkspaceId, unitId) :
            EMPTY;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(store => this.metadataNotLoaded.set(!store));
    combineLatest([this.workspaceService.selectedUnit$, this.hiddenRoutes$, this.settingsLoaded$])
      .pipe(
        // the defaults a workspace is entered with would ask for tabs it hides (#2135)
        filter(([, , settingsLoaded]) => settingsLoaded),
        map(([unitId, hiddenRoutes]): PresenceQuery => ({
          unitId, comments: isTabShown(hiddenRoutes, 'comments'), notes: isTabShown(hiddenRoutes, 'notes')
        })),
        distinctUntilChanged(sameQuery),
        startWith(undefined),
        pairwise(),
        switchMap(([last, query]) => {
          if (!query) return of(undefined);
          const known = this.presence();
          // a tab only hidden needs nothing new: what is known of the others still holds
          if (last && known && last.unitId === query.unitId &&
            (last.comments || !query.comments) && (last.notes || !query.notes)) return this.loadPresence(query, known);
          this.presence.set(undefined);
          return this.loadPresence(query);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(presence => this.presence.set(presence));
  }

  /** Loads all that is checked; the stores are shared with the tabs, so none is requested twice. */
  private load(unitId: number): Observable<UnitCheckSources> {
    const workspaceId = this.workspaceService.selectedWorkspaceId;
    // loaded once; asked again on the next unit only when the last load failed
    const modulesLoaded = this.moduleService.listLoaded() ?
      of(undefined) :
      from(this.moduleService.loadList());
    // Definition and scheme are asked for, hidden tabs or not: whether there is content the player can
    // play, and whether the export would write an id twice, is asked under the properties where those
    // tabs are hidden. The definition itself is not loaded: it embeds the unit's media and runs to megabytes, and the
    // check needs only whether there is one and its format (#2135). Where the editor already holds
    // it, the check reads that instead.
    const storedDefinition = this.unitStores.definitionStore() ?
      of(undefined) :
      this.backendService.getUnitDefinitionSummary(workspaceId, unitId).pipe(map(summary => summary ?? undefined));
    return forkJoin([
      modulesLoaded,
      this.unitStores.loadPropertiesStore(workspaceId, unitId),
      storedDefinition,
      this.unitStores.loadSchemeStore(workspaceId, unitId),
      // asked whatever the stored unit needs: the editor may report what it needs at any time (#2198)
      this.installedDependencies.load(workspaceId),
      this.loadSizeLevels()
    ]).pipe(map(([, , summary, , installed, sizeLevels]) => ({
      definitionSummary: summary,
      installedDependencies: installed,
      sizeLevels
    })));
  }

  /**
   * Where the levels of a unit's size begin (#2229): read once while the card is shown. A failed read
   * is not kept, so that the next unit asks again rather than showing sizes without levels for the
   * rest of the visit.
   */
  private loadSizeLevels(): Observable<UnitSizeLevels | null> {
    if (!this.sizeLevels$) {
      const sizeLevels$ = this.appBackendService.getUnitValidation().pipe(
        map(validation => validation?.sizeLevels ?? null),
        tap(levels => {
          if (!levels && this.sizeLevels$ === sizeLevels$) this.sizeLevels$ = undefined;
        }),
        shareReplay(1)
      );
      this.sizeLevels$ = sizeLevels$;
    }
    return this.sizeLevels$;
  }

  /**
   * Whether there are comments and notes; those the workspace hides are not checked, and not asked
   * for. What is known already is not asked again. Both are asked again whenever they change: a
   * comment written or a note added beside the properties, in a pinned tab, shows here (#2135).
   */
  private loadPresence({ unitId, comments, notes }: PresenceQuery, known?: Presence): Observable<Presence> {
    const workspaceId = this.workspaceService.selectedWorkspaceId;
    // every question through one switchMap: a newer one cancels an answer still on its way, which
    // would tell of the comments before the change
    const commentsChanged: Observable<unknown> = this.workspaceService.onCommentsUpdated;
    const askedComments = (known ? commentsChanged : commentsChanged.pipe(startWith(undefined)))
      .pipe(switchMap(() => this.commentsBackendService.hasComments(workspaceId, unitId)));
    let hasComments: Observable<boolean | undefined> = of(undefined);
    if (comments) hasComments = known ? askedComments.pipe(startWith(known.hasComments)) : askedComments;
    // the same for rich notes, added or deleted in a pinned tab
    const notesChanged: Observable<unknown> = this.workspaceService.richNotesChanged$;
    const askedRichNotes = (known ? notesChanged : notesChanged.pipe(startWith(undefined)))
      .pipe(switchMap(() => this.backendService.hasUnitRichNotes(workspaceId, unitId)));
    let hasRichNotes: Observable<boolean | undefined> = of(undefined);
    if (notes) hasRichNotes = known ? askedRichNotes.pipe(startWith(known.hasRichNotes)) : askedRichNotes;
    return combineLatest([hasComments, hasRichNotes])
      .pipe(map(([commentsPresent, notesPresent]) => ({ hasComments: commentsPresent, hasRichNotes: notesPresent })));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

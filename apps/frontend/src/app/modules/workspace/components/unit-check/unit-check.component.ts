import {
  Component, computed, OnDestroy, OnInit, signal
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  combineLatest, distinctUntilChanged, filter, forkJoin, from, map, Observable, of, pairwise, startWith, Subject,
  switchMap, takeUntil
} from 'rxjs';
import {
  MatCard, MatCardContent, MatCardHeader, MatCardTitle
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { UnitDefinitionSummaryDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { ModuleService } from '../../../../services/module.service';
import { BackendService as CommentsBackendService } from '../../../comments/services/backend.service';
import {
  checkUnit, definitionSummary, isTabShown, ModuleType, UnitCheckFinding, UnitCheckSection, withKeyFindings
} from '../../utils/unit-check.utils';
import { checkUnitKey } from '../../utils/unit-key.utils';
import { VariableIdConflictListComponent } from '../variable-id-conflict-list/variable-id-conflict-list.component';
import { VariableIdConflictFixComponent } from '../variable-id-conflict-fix/variable-id-conflict-fix.component';

/** What the check reads from the server for the unit, apart from the stores. */
interface UnitCheckSources {
  /** The server's summary of the stored definition; not asked for where the editor holds it. */
  definitionSummary: UnitDefinitionSummaryDto | undefined;
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
  // the comment calls are provided where they are used, as the comments component does
  providers: [CommentsBackendService],
  imports: [
    MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatIcon, MatProgressSpinner, TranslateModule,
    VariableIdConflictListComponent, VariableIdConflictFixComponent
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
    const metadataStore = this.unitStores.metadataStore();
    if (!metadataStore?.loaded) return undefined;
    const { editor, player, schemer } = metadataStore.data();
    return { editor, player, schemer };
  }, { equal: sameModules });

  // the key as it is being typed, and only the key: a keystroke in the name changes nothing here
  private readonly unitKey = computed((): UnitKey | undefined => {
    const metadataStore = this.unitStores.metadataStore();
    if (!metadataStore?.loaded) return undefined;
    const { id, key } = metadataStore.data();
    return { id, key };
  }, { equal: (a, b) => a?.id === b?.id && a?.key === b?.key });

  // checked apart from the rest, so that a keystroke in the key does not parse the scheme again; the
  // list of units is read as a signal, as it may arrive after the unit (#1842)
  private readonly keyFindings = computed((): UnitCheckFinding[] => {
    const unitKey = this.unitKey();
    return unitKey ? checkUnitKey(unitKey.key, unitKey.id, this.workspaceService.units()) : [];
  });

  private readonly checked = computed((): UnitCheckSection[] | undefined => {
    const sources = this.sources();
    const presence = this.presence();
    if (!sources || !presence) return undefined;
    // the maps of installed modules are no signals: checked again when a reload replaces them
    this.moduleService.listVersion();
    const definitionStore = this.unitStores.definitionStore();
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
      // the editor's definition where it is loaded, unsaved changes included; else the server's summary
      definition: definitionStore ? definitionSummary(definitionStore.data()) : sources.definitionSummary,
      // as the schemer is given them: an editor that never reported variables leaves them to the scheme
      variables: definitionStore?.data().variables || schemeStore?.data().variables,
      scheme: schemeStore?.data(),
      unsaved: {
        variables: definitionStore?.variablesChanged() ?? false,
        scheme: schemeStore?.changed() ?? false
      },
      ...presence,
      hiddenRoutes: this.workspaceService.hiddenRoutes()
    });
  });

  readonly sections = computed((): UnitCheckSection[] | undefined => {
    const checked = this.checked();
    return checked && withKeyFindings(checked, this.keyFindings());
  });

  constructor(
    private workspaceService: WorkspaceService,
    private unitStores: UnitStoresService,
    private moduleService: ModuleService,
    private backendService: WorkspaceBackendService,
    private commentsBackendService: CommentsBackendService
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
          const known = this.presence();
          // a tab only hidden needs nothing new: what is known of the others still holds
          if (query && last && known && last.unitId === query.unitId &&
            (last.comments || !query.comments) && (last.notes || !query.notes)) return of(known);
          this.presence.set(undefined);
          return query ? this.loadPresence(query) : of(undefined);
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
      this.unitStores.loadMetadataStore(workspaceId, unitId),
      storedDefinition,
      this.unitStores.loadSchemeStore(workspaceId, unitId)
    ]).pipe(map(([, , summary]) => ({ definitionSummary: summary })));
  }

  /** Whether there are comments and notes; those the workspace hides are not checked, and not asked for. */
  private loadPresence({ unitId, comments, notes }: PresenceQuery): Observable<Presence> {
    const workspaceId = this.workspaceService.selectedWorkspaceId;
    const hasComments = comments ?
      this.commentsBackendService.hasComments(workspaceId, unitId) :
      of(undefined);
    const hasRichNotes = notes ?
      this.backendService.getUnitRichNotes(workspaceId, unitId)
        .pipe(map(richNotes => (richNotes ? richNotes.notes.length > 0 : undefined))) :
      of(undefined);
    return forkJoin([hasComments, hasRichNotes])
      .pipe(map(([commentsPresent, notesPresent]) => ({ hasComments: commentsPresent, hasRichNotes: notesPresent })));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

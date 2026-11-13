import {
  Component, computed, OnDestroy, OnInit, signal
} from '@angular/core';
import {
  forkJoin, from, map, Observable, of, Subject, switchMap, takeUntil
} from 'rxjs';
import {
  MatCard, MatCardContent, MatCardHeader, MatCardTitle
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { ModuleService } from '../../../../services/module.service';
import { BackendService as CommentsBackendService } from '../../../comments/services/backend.service';
import { checkUnit, ModuleType, UnitCheckSection } from '../../utils/unit-check.utils';
import { VariableIdConflictListComponent } from '../variable-id-conflict-list/variable-id-conflict-list.component';
import { VariableIdConflictFixComponent } from '../variable-id-conflict-fix/variable-id-conflict-fix.component';

/** What the check reads from the server, apart from the stores. */
interface UnitCheckSources {
  hasComments: boolean | undefined;
  hasRichNotes: boolean | undefined;
  hiddenRoutes: string[];
}

type Modules = Partial<Record<ModuleType, string>>;

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

  // only the modules of the properties: the check, which parses the scheme, must not run again on
  // every keystroke in the name or the description
  private readonly modules = computed((): Modules | undefined => {
    const metadataStore = this.unitStores.metadataStore();
    if (!metadataStore?.loaded) return undefined;
    const { editor, player, schemer } = metadataStore.data();
    return { editor, player, schemer };
  }, { equal: sameModules });

  readonly sections = computed((): UnitCheckSection[] | undefined => {
    const sources = this.sources();
    if (!sources) return undefined;
    return checkUnit({
      modules: this.modules(),
      installed: {
        editor: this.moduleService.editors,
        player: this.moduleService.players,
        schemer: this.moduleService.schemers
      },
      definition: this.unitStores.definitionStore()?.data(),
      scheme: this.unitStores.schemeStore()?.data(),
      ...sources
    });
  });

  constructor(
    private workspaceService: WorkspaceService,
    private unitStores: UnitStoresService,
    private moduleService: ModuleService,
    private backendService: WorkspaceBackendService,
    private commentsBackendService: CommentsBackendService
  ) {}

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
  }

  /** Loads all that is checked; the stores are shared with the tabs, so none is requested twice. */
  private load(unitId: number): Observable<UnitCheckSources> {
    const workspaceId = this.workspaceService.selectedWorkspaceId;
    const hiddenRoutes = this.workspaceService.workspaceSettings?.hiddenRoutes || [];
    const modulesLoaded = Object.keys(this.moduleService.editors).length > 0 ?
      of(undefined) :
      from(this.moduleService.loadList());
    // what the workspace hides is not shown, and so not asked for
    const hasComments = hiddenRoutes.includes('comments') ?
      of(undefined) :
      this.commentsBackendService.hasComments(workspaceId, unitId);
    const hasRichNotes = hiddenRoutes.includes('notes') ?
      of(undefined) :
      this.backendService.getUnitRichNotes(workspaceId, unitId)
        .pipe(map(richNotes => (richNotes ? richNotes.notes.length > 0 : undefined)));
    return forkJoin([
      modulesLoaded,
      this.unitStores.loadMetadataStore(workspaceId, unitId),
      this.unitStores.loadDefinitionStore(workspaceId, unitId),
      this.unitStores.loadSchemeStore(workspaceId, unitId),
      hasComments,
      hasRichNotes
    ]).pipe(
      map(([, , , , comments, richNotes]) => ({ hasComments: comments, hasRichNotes: richNotes, hiddenRoutes }))
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

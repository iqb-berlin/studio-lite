import {
  Component, computed, inject, OnDestroy, OnInit, signal
} from '@angular/core';
import {
  BehaviorSubject, EMPTY, filter, forkJoin, Observable, of, Subject, switchMap, take, takeUntil, tap
} from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { UnitMetadataValues, WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import {
  MatCard, MatCardContent, MatCardHeader, MatCardTitle
} from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MDProfile } from '@iqbspecs/metadata-profile';
import { ProfileFormComponent, UnitMetadataValues as IqbUnitMetadataValues } from '@iqb/metadata-components';
import { ItemsComponent } from '../../../metadata/components/items/items.component';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { UnitMetadataStore } from '../../classes/unit-metadata-store';
import { AliasId } from '../../../metadata/models/alias-id.interface';
import { MetadataBackendService } from '../../../metadata/services/metadata-backend.service';
import { MetadataService } from '../../../metadata/services/metadata.service';
import { LanguageService } from '../../../../services/language.service';
import { MetadataProfiles, metadataProfiles } from '../../utils/metadata-profiles.utils';
import { MetadataProfilesComponent } from '../metadata-profiles/metadata-profiles.component';

/**
 * The unit's metadata, in a tab of their own beside the properties (#2200): the profile form for the
 * unit and the items with theirs. They write into the unit's metadata store; saving and discarding go
 * with the rest of the unit.
 *
 * Units are clicked through quickly, and an answer, a form or an event that comes late must not reach
 * the unit opened meanwhile. Loading follows the selected unit through `switchMap`, so the tab stops
 * listening for the unit before (the stores drop an answer for it); the forms are taken away the moment
 * another unit is selected and built again for its store; and an edit is written only into the store of
 * the unit the forms were built for.
 */
@Component({
  selector: 'studio-lite-unit-metadata',
  templateUrl: './unit-metadata.component.html',
  styleUrls: ['./unit-metadata.component.scss'],
  imports: [
    MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatProgressSpinner, TranslateModule,
    ProfileFormComponent, ItemsComponent, MetadataProfilesComponent
  ]
})
export class UnitMetadataComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  // the unit the forms are built for; 0 while none is
  private formsUnitId = 0;
  metadata: UnitMetadataValues = {};
  // the same object, as the profile form types it
  iqbMetadataValues: IqbUnitMetadataValues = {} as IqbUnitMetadataValues;

  workspaceSettings!: WorkspaceSettingsDto;
  unitProfile!: MDProfile;
  itemProfile!: MDProfile;
  readonly variablesLoader = new BehaviorSubject<AliasId[]>([]);
  private readonly metadataLoadedState = signal(false);
  /** Whether the forms show the metadata of the selected unit. */
  readonly metadataLoaded = this.metadataLoadedState.asReadonly();
  private readonly variablesLoadedState = signal(false);
  readonly variablesLoaded = this.variablesLoadedState.asReadonly();
  private readonly notLoadedState = signal(false);
  /** The server did not deliver the metadata of the selected unit. */
  readonly notLoaded = this.notLoadedState.asReadonly();
  /**
   * Which profiles the workspace assigns, and of which others the unit keeps values that are not used
   * (#2235); as the metadata are edited, once the forms show the selected unit, and once the settings
   * say which profiles the workspace assigns: before, every profile would look unused.
   */
  readonly profileUse = computed((): MetadataProfiles | undefined => {
    const store = this.unitStores.metadataStore();
    if (!store || !this.metadataLoaded() || !this.workspaceService.settingsLoaded()) return undefined;
    return metadataProfiles(store.data(), this.workspaceService.metadataProfileIds());
  });

  /**
   * The language of the interface, handed to the metadata forms: they show profiles and vocabularies
   * in it where these bring it. The studio translates no metadata (#2204).
   */
  readonly language = inject(LanguageService).active.code;

  private readonly settingsLoaded$: Observable<boolean>;

  constructor(
    private workspaceService: WorkspaceService,
    private unitStores: UnitStoresService,
    private metadataBackendService: MetadataBackendService,
    public metadataService: MetadataService
  ) {
    this.settingsLoaded$ = toObservable(this.workspaceService.settingsLoaded);
  }

  ngOnInit(): void {
    this.workspaceService.selectedUnit$
      .pipe(
        tap(() => this.takeFormsAway()),
        switchMap(unitId => {
          const workspaceId = this.workspaceService.selectedWorkspaceId;
          if (!(unitId > 0)) return EMPTY;
          return forkJoin([
            this.unitStores.loadMetadataStore(workspaceId, unitId),
            this.unitStores.loadSchemeStore(workspaceId, unitId),
            // The forms take the profiles from the workspace settings, which may come later than the
            // stores: the forms kept the defaults the workspace is entered with, without profiles (#2223).
            this.workspaceService.settingsLoaded() ?
              of(true) :
              this.settingsLoaded$.pipe(filter(loaded => loaded), take(1))
          ]);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(([metadataStore, schemeStore]) => {
        if (!metadataStore) {
          this.notLoadedState.set(true);
          return;
        }
        this.buildForms();
        // handed on only once the scheme is there: without it the list is empty, and an item would take
        // the empty list for its variable having gone
        if (schemeStore) this.updateVariables();
      });
    // the editor may open a definition store only after this view, pinned beside it
    this.unitStores.definitionStore$
      .pipe(
        switchMap(store => store?.dataChange ?? EMPTY),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => this.updateVariables());
    // after a save that created items, so that the items editor holds their uuids
    this.workspaceService.unitMetadataReloaded
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.buildForms());
  }

  /** Builds the forms for the store of the selected unit, if it is there. */
  private buildForms(): void {
    const store = this.unitStores.metadataStore();
    if (!store || store.unitId !== this.workspaceService.selectedUnit$.getValue()) return;
    this.workspaceSettings = this.workspaceService.workspaceSettings;
    this.metadata = JSON.parse(JSON.stringify(store.getData()));
    this.iqbMetadataValues = this.metadata as unknown as IqbUnitMetadataValues;
    this.formsUnitId = store.unitId;
    this.metadataLoadedState.set(true);
    this.loadProfiles();
  }

  /** Another unit is selected: the forms of the one before must not report any more. */
  private takeFormsAway(): void {
    this.formsUnitId = 0;
    this.metadataLoadedState.set(false);
    this.variablesLoadedState.set(false);
    this.notLoadedState.set(false);
  }

  private updateVariables(): void {
    if (!this.unitStores.schemeStore()) return;
    this.variablesLoader.next(this.unitStores.variables());
    this.variablesLoadedState.set(true);
  }

  private loadProfiles(): void {
    const settings = this.workspaceSettings;
    if (settings?.unitMDProfile && !this.unitProfile) {
      this.metadataBackendService
        .getMetadataProfile(settings.unitMDProfile)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(profile => {
          const unitProfile = profile as unknown as MDProfile;
          this.metadataService.loadProfileVocabularies(unitProfile).then(() => {
            this.unitProfile = unitProfile;
          });
        });
    }
    if (settings?.itemMDProfile && !this.itemProfile) {
      this.metadataBackendService
        .getMetadataProfile(settings.itemMDProfile)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(profile => {
          const itemProfile = profile as unknown as MDProfile;
          this.metadataService.loadProfileVocabularies(itemProfile).then(() => {
            this.itemProfile = itemProfile;
          });
        });
    }
  }

  /**
   * Profiles and items are edited by two independent child components. Each change must update only
   * its own slice of the stored metadata: merging into the store's current value (rather than
   * replacing it, or rebuilding `this.metadata` which would retrigger the items editor and drop
   * in-flight item edits) keeps both the unit profiles and the item metadata when either side
   * changes.
   */
  onMetadataChange(metadata: Partial<IqbUnitMetadataValues>): void {
    const store = this.formsStore();
    if (!store) return;
    // Only overwrite the profiles slice when the event actually carries one, so a
    // profiles-less emit can never clobber the stored profiles (an empty array is
    // a deliberate "clear", undefined is not).
    store.setMetadata({
      ...store.getData(),
      ...(metadata.profiles && { profiles: metadata.profiles as unknown as UnitMetadataValues['profiles'] })
    });
  }

  onItemsMetadataChange(metadata: UnitMetadataValues): void {
    const store = this.formsStore();
    if (!store) return;
    store.setMetadata({
      ...store.getData(),
      ...(metadata.items && { items: metadata.items })
    });
  }

  /** The store the forms were built for, as long as it is still the one held for the selected unit. */
  private formsStore(): UnitMetadataStore | undefined {
    const store = this.unitStores.metadataStore();
    return store && store.unitId === this.formsUnitId ? store : undefined;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

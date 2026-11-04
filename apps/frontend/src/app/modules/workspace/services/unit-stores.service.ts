import {
  computed, Injectable, signal, WritableSignal
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  filter, map, Observable, of, shareReplay, Subject, tap
} from 'rxjs';
import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { WorkspaceBackendService } from './workspace-backend.service';
import { UnitMetadataStore } from '../classes/unit-metadata-store';
import { UnitDefinitionStore } from '../classes/unit-definition-store';
import { UnitSchemeStore } from '../classes/unit-scheme-store';
import { unitVariables } from '../utils/unit-variables.utils';

/** One store of the open unit, and the request that is loading it, if one is. */
interface StoreSlot<T> {
  store: WritableSignal<T | undefined>;
  loading?: Observable<T | undefined>;
}

/**
 * Holds the stores of the unit that is open -- metadata, definition and scheme -- and is the only
 * place that loads them. Whichever tab needs a store first asks for it here; a second tab asking
 * while it is still on its way shares the same request instead of starting one that would replace
 * the first store.
 *
 * The stores and whether any of them holds unsaved work are signals, so whoever looks at them gets
 * the current answer, also one that comes later than the store. That is what the save button lacked:
 * it learned of a store only by an event and missed one set before it existed (#1290).
 */
@Injectable({
  providedIn: 'root'
})
export class UnitStoresService {
  private readonly metadata: StoreSlot<UnitMetadataStore> = { store: signal(undefined) };
  private readonly definition: StoreSlot<UnitDefinitionStore> = { store: signal(undefined) };
  private readonly scheme: StoreSlot<UnitSchemeStore> = { store: signal(undefined) };
  // counts the resets, so that a response arriving for a unit that has been left is not kept
  private generation = 0;

  readonly metadataStore = this.metadata.store.asReadonly();
  readonly definitionStore = this.definition.store.asReadonly();
  readonly schemeStore = this.scheme.store.asReadonly();
  readonly definitionStore$ = toObservable(this.definitionStore);

  readonly changed = computed(() => !!(
    this.metadataStore()?.changed() ||
    this.definitionStore()?.changed() ||
    this.schemeStore()?.changed()
  ));

  /** The variables an item may refer to, as they are now, saved or not (#1361). */
  readonly variables = computed(() => unitVariables(
    this.definitionStore()?.data(),
    this.schemeStore()?.data()
  ));

  private readonly metadataLoadedSubject = new Subject<UnitPropertiesDto>();
  /** The unit properties as they come from the server, each time they are loaded anew. */
  readonly metadataLoaded$ = this.metadataLoadedSubject.asObservable();

  constructor(private backendService: WorkspaceBackendService) {}

  /**
   * The unit's properties and metadata; a unit the server does not answer for gets an empty store,
   * marked as not loaded.
   */
  loadMetadataStore(workspaceId: number, unitId: number): Observable<UnitMetadataStore | undefined> {
    return this.load(
      this.metadata,
      () => this.backendService
        .getUnitProperties(workspaceId, unitId)
        .pipe(map(unitData => (unitData ?
          new UnitMetadataStore(unitData) :
          new UnitMetadataStore(<UnitPropertiesDto>{ id: unitId }, false)))),
      store => this.metadataLoadedSubject.next(store.getData())
    );
  }

  /** The unit's definition; undefined if the server does not deliver it. */
  loadDefinitionStore(workspaceId: number, unitId: number): Observable<UnitDefinitionStore | undefined> {
    return this.load(this.definition, () => this.backendService
      .getUnitDefinition(workspaceId, unitId)
      .pipe(
        map(unitDefinition => (unitDefinition ? new UnitDefinitionStore(unitId, unitDefinition) : undefined))
      ));
  }

  /** The unit's coding scheme; undefined if the server does not deliver it. */
  loadSchemeStore(workspaceId: number, unitId: number): Observable<UnitSchemeStore | undefined> {
    return this.load(this.scheme, () => this.backendService
      .getUnitScheme(workspaceId, unitId)
      .pipe(
        map(unitScheme => (unitScheme ? new UnitSchemeStore(unitId, unitScheme) : undefined))
      ));
  }

  /** Discards the unsaved work in every store there is. */
  restore(): void {
    this.metadataStore()?.restore();
    this.definitionStore()?.restore();
    this.schemeStore()?.restore();
  }

  /** Lets go of the stores, when another unit is opened; requests still under way are ignored. */
  reset(): void {
    this.generation += 1;
    [this.metadata, this.definition, this.scheme].forEach(slot => {
      slot.loading = undefined;
      slot.store.set(undefined);
    });
  }

  private load<T>(
    slot: StoreSlot<T>,
    request: () => Observable<T | undefined>,
    onLoaded?: (store: T) => void
  ): Observable<T | undefined> {
    const store = slot.store();
    if (store) return of(store);
    if (!slot.loading) {
      const generation = this.generation;
      slot.loading = request().pipe(
        // the answer for a unit that has been left is neither kept nor handed to anyone still waiting
        filter(() => generation === this.generation),
        tap(newStore => {
          // the next one to ask finds the store, or after a failure tries again
          slot.loading = undefined;
          if (newStore) {
            slot.store.set(newStore);
            onLoaded?.(newStore);
          }
        }),
        shareReplay(1)
      );
    }
    return slot.loading;
  }
}

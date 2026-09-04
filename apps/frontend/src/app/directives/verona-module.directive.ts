import {
  Directive, ElementRef, OnDestroy
} from '@angular/core';
import {
  BehaviorSubject, from, map, Observable, of, Subject, takeUntil
} from 'rxjs';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedParameter } from '../models/verona.interface';
import { UnitMetadataStore } from '../modules/workspace/classes/unit-metadata-store';
import { ModuleService } from '../services/module.service';
import { VeronaModuleClass } from '../models/verona-module.class';
import { UnitDefinitionStore } from '../modules/workspace/classes/unit-definition-store';
import { WorkspaceBackendService } from '../modules/workspace/services/workspace-backend.service';
import { WorkspaceService } from '../modules/workspace/services/workspace.service';
import { AppService } from '../services/app.service';

/**
 * The base every component that hosts a Verona module builds on -- editor, player, schemer, the
 * print view. It owns the iframe the module runs in and the postMessage conversation with it:
 * which module to load, handing the unit over once the module says it is ready, and taking what
 * comes back.
 *
 * A module runs in a page of its own and can only be talked to by messages, so the parts that
 * cannot be shared -- what a message means, what to do with a changed unit -- are left abstract for
 * the hosting component to answer.
 */
@Directive({
  selector: '[veronaModule]',
  standalone: true
})
export abstract class VeronaModuleDirective implements OnDestroy {
  abstract moduleService: ModuleService;
  abstract translateService: TranslateService;
  abstract snackBar: MatSnackBar;
  abstract backendService: WorkspaceBackendService;
  abstract workspaceService: WorkspaceService;
  abstract appService: AppService;
  abstract hostingIframe: ElementRef;

  postMessageTarget: Window | undefined;
  sessionId = '';
  message = '';
  iFrameElement: HTMLIFrameElement | undefined;
  lastVeronaModuleId = '';
  sharedParameters: SharedParameter[] = [];
  ngUnsubscribe = new Subject<void>();
  unitLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  loading = false;

  constructor() {
    this.unitLoaded.subscribe(loaded => setTimeout(() => {
      this.loading = !loaded;
    })
    );
  }

  abstract onSelectedUnitChange(): void;

  abstract postStore(store: unknown): void;

  abstract handleIncomingMessage(m: MessageEvent): void;

  setHostingIframe(): void {
    this.iFrameElement = this.hostingIframe.nativeElement;
  }

  subscribeForSelectedUnitChange(): void {
    this.workspaceService.selectedUnit$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.onSelectedUnitChange());
  }

  subscribeForPostMessages(): void {
    this.appService.postMessage$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((m: MessageEvent) => this.handleIncomingMessage(m));
  }

  sendUnitDefinition(
    unitId: number,
    unitDefinitionStore: UnitDefinitionStore | undefined
  ): void {
    if (!unitId) {
      this.message = this.translateService.instant('workspace.unit-not-found');
      this.postMessageTarget = undefined;
      return;
    }
    if (unitId && unitDefinitionStore) {
      this.postStore(unitDefinitionStore);
    } else {
      this.backendService
        .getUnitDefinition(this.workspaceService.selectedWorkspaceId, unitId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(unitDefinitionDto => {
          if (unitDefinitionDto) {
            const newUnitDefinitionStore = new UnitDefinitionStore(
              unitId,
              unitDefinitionDto
            );
            this.workspaceService.setUnitDefinitionStore(
              newUnitDefinitionStore
            );
            this.postStore(newUnitDefinitionStore);
          } else {
            this.snackBar.open(
              this.translateService.instant(
                'workspace.unit-definition-not-loaded'
              ),
              this.translateService.instant('workspace.error'),
              { duration: 3000 }
            );
          }
        });
    }
  }

  private getModulesByType(
    moduleType: 'player' | 'editor' | 'schemer'
  ): Record<string, VeronaModuleClass> {
    const serviceProperties: Record<string, keyof ModuleService> = {
      player: 'players',
      editor: 'editors',
      schemer: 'schemers'
    };
    return this.moduleService[serviceProperties[moduleType]] as Record<
    string,
    VeronaModuleClass
    >;
  }

  getVeronaModuleId(
    unitMetadataStore: UnitMetadataStore | undefined,
    moduleType: 'player' | 'editor' | 'schemer'
  ): Observable<string> {
    if (!unitMetadataStore) {
      return of('');
    }

    const unitMetadata = unitMetadataStore.getData();
    const metadataKey = unitMetadata[moduleType];
    const modules = this.getModulesByType(moduleType);

    const loadList$ =
      Object.keys(modules).length === 0 ?
        from(this.moduleService.loadList()) :
        of(undefined);

    return loadList$.pipe(
      map(() => {
        const updatedModules = this.getModulesByType(moduleType);
        return metadataKey ?
          VeronaModuleFactory.getBestMatch(
            metadataKey,
            Object.keys(updatedModules)
          ) :
          '';
      })
    );
  }

  /**
   * The frame is emptied only when there is no module to show. It must not be emptied on the way to
   * a module: the module HTML is held after its first load, so the two assignments would then fall
   * into the same task, and Chrome 152 keeps the empty document and drops the module -- the frame
   * stays blank until the page is reloaded (#1662). Setting srcdoc once navigates the frame away
   * from the previous module by itself.
   */
  protected buildVeronaModule(
    moduleId: string | undefined,
    moduleType: 'player' | 'editor' | 'schemer'
  ): void {
    if (!this.iFrameElement) {
      return;
    }

    // The module being replaced must not be able to talk to the studio any more. It cannot be
    // told apart by its window -- srcdoc navigation keeps one and the same contentWindow -- so the
    // session id is what distinguishes it from its successor, and the outgoing one stops counting
    // here. The successor draws a new one when it reports ready.
    this.sessionId = '';

    if (!moduleId) {
      this.clearIFrame();
      this.lastVeronaModuleId = '';
      return;
    }

    const modules = this.getModulesByType(moduleType);
    const moduleFile = modules[moduleId];

    from(this.moduleService.getModuleHtml(moduleFile))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(moduleData => {
        if (moduleData) {
          this.setupIFrame(moduleData);
          this.lastVeronaModuleId = moduleId;
          this.message = '';
        } else {
          this.clearIFrame();
          this.message = this.translateService.instant(
            `workspace.${moduleType}-not-loaded`,
            { id: moduleId }
          );
          this.lastVeronaModuleId = '';
        }
      });
  }

  private clearIFrame(): void {
    if (this.iFrameElement) {
      this.iFrameElement.srcdoc = '';
    }
  }

  private setupIFrame(editorHtml: string): void {
    if (this.iFrameElement && this.iFrameElement.parentElement) {
      this.iFrameElement.srcdoc = editorHtml;
    }
  }

  protected getMergedSharedParameters(newParameters: SharedParameter[]): SharedParameter[] {
    const mergedMap = new Map<string, string>([
      ...this.sharedParameters.map(p => [p.key, p.value] as const),
      ...newParameters.map(p => [p.key, p.value] as const)
    ]);
    return Array.from(mergedMap, ([key, value]) => ({ key, value }));
  }

  static getSessionId(): string {
    const min = 10_000_000; // Kleinste 8-stellige Zahl
    const max = 99_999_999; // Größte 8-stellige Zahl
    const range = max - min + 1; // Anzahl möglicher Werte
    const maxValid = Math.floor(2 ** 32 / range) * range; // Bias vermeiden

    let rand: number;
    const uint32 = new Uint32Array(1);

    do {
      window.crypto.getRandomValues(uint32);
      [rand] = uint32;
    } while (rand >= maxValid);

    return ((rand % range) + min).toString();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.unitLoaded.complete();
  }
}

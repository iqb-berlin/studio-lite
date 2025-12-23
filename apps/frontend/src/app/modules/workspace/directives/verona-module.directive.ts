import { Directive, OnDestroy } from '@angular/core';
import {
  BehaviorSubject, from, map, Observable, of, Subject, takeUntil
} from 'rxjs';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnitMetadataStore } from '../classes/unit-metadata-store';
import { ModuleService } from '../../shared/services/module.service';
import { VeronaModuleClass } from '../../shared/models/verona-module.class';
import { UnitDefinitionStore } from '../classes/unit-definition-store';
import { WorkspaceBackendService } from '../services/workspace-backend.service';
import { WorkspaceService } from '../services/workspace.service';

@Directive({
  selector: '[veronaModule]',
  standalone: false
})
export abstract class VeronaModuleDirective implements OnDestroy {
  abstract moduleService: ModuleService;
  abstract translateService: TranslateService;
  abstract snackBar: MatSnackBar;
  abstract backendService: WorkspaceBackendService;
  abstract workspaceService: WorkspaceService;

  postMessageTarget: Window | undefined;
  sessionId = '';
  message = '';
  iFrameElement: HTMLIFrameElement | undefined;
  lastVeronaModulId = '';
  ngUnsubscribe = new Subject<void>();
  unitLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  loading = false;

  constructor() {
    this.unitLoaded.subscribe(loaded => setTimeout(() => {
      this.loading = !loaded;
    })
    );
  }

  abstract postStore(store: unknown): void;

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
    return this.moduleService[serviceProperties[moduleType]] as Record<string, VeronaModuleClass>;
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

  protected buildVeronaModule(
    moduleId: string | undefined,
    moduleType: 'player' | 'editor' | 'schemer'
  ): void {
    if (!this.iFrameElement) {
      return;
    }

    this.iFrameElement.srcdoc = '';

    if (!moduleId) {
      this.lastVeronaModulId = '';
      return;
    }

    const modules = this.getModulesByType(moduleType);
    const moduleFile = modules[moduleId];

    from(this.moduleService.getModuleHtml(moduleFile))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(moduleData => {
        if (moduleData) {
          this.setupIFrame(moduleData);
          this.lastVeronaModulId = moduleId;
          this.message = '';
        } else {
          this.message = this.translateService.instant(
            `workspace.${moduleType}-not-loaded`,
            { id: moduleId }
          );
          this.lastVeronaModulId = '';
        }
      });
  }

  private setupIFrame(editorHtml: string): void {
    if (this.iFrameElement && this.iFrameElement.parentElement) {
      this.iFrameElement.srcdoc = editorHtml;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.unitLoaded.complete();
  }
}

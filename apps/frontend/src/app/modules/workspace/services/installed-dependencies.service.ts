import { Injectable } from '@angular/core';
import {
  forkJoin, from, map, Observable, of, shareReplay, tap
} from 'rxjs';
import { WorkspaceBackendService } from './workspace-backend.service';
import { ModuleService } from '../../../services/module.service';
import { InstalledDependencies } from '../utils/missing-dependencies.utils';

/**
 * The resource packages served in a workspace -- which package serves a name depends on its group
 * (#1358) -- and the installed widget types: what the preview warns about and the unit check lists
 * against (#1602, #2198), so that both answer alike. Read once per workspace for the component
 * that provides the service, for as long as it is shown.
 *
 * A list that could not be read is null: unknown is not missing, and the other list still counts. A
 * failed read is not kept, so the next unit asks again rather than going without a check for the
 * rest of the visit.
 */
@Injectable()
export class InstalledDependenciesService {
  private loaded?: {
    workspaceId: number;
    installed$: Observable<InstalledDependencies>;
  };

  constructor(
    private backendService: WorkspaceBackendService,
    private moduleService: ModuleService
  ) {}

  load(workspaceId: number): Observable<InstalledDependencies> {
    if (this.loaded?.workspaceId !== workspaceId) {
      const installed$ = forkJoin([
        this.backendService.getResourcePackageNames(workspaceId),
        // the module service keeps the widgets for the session; an empty list may be one never loaded
        Object.keys(this.moduleService.widgets).length === 0 ? from(this.moduleService.loadWidgets()) : of(true)
      ]).pipe(
        map(([packages, widgetsLoaded]): InstalledDependencies => ({
          packages,
          widgets: widgetsLoaded ?
            Object.values(this.moduleService.widgets).map(widget => widget.metadata?.model ?? '') :
            null
        })),
        tap(installed => {
          const failed = !installed.packages || !installed.widgets;
          if (failed && this.loaded?.installed$ === installed$) this.loaded = undefined;
        }),
        shareReplay(1)
      );
      this.loaded = { workspaceId, installed$ };
    }
    return this.loaded.installed$;
  }
}

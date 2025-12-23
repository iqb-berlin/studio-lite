import { Directive } from '@angular/core';
import {
  from, map, Observable, of
} from 'rxjs';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { UnitMetadataStore } from '../classes/unit-metadata-store';
import { ModuleService } from '../../shared/services/module.service';

@Directive({
  selector: '[veronaModule]',
  standalone: false
})
export abstract class VeronaModuleDirective {
  abstract moduleService: ModuleService;

  private getVeronaModuleId(
    unitMetadataStore: UnitMetadataStore | undefined,
    moduleType: 'player' | 'editor' | 'schemer'
  ): Observable<string> {
    if (!unitMetadataStore) {
      return of('');
    }

    const unitMetadata = unitMetadataStore.getData();
    const metadataKey = unitMetadata[moduleType];

    const serviceProperties: Record<string, keyof ModuleService> = {
      player: 'players',
      editor: 'editors',
      schemer: 'schemers'
    };

    const serviceProperty = serviceProperties[moduleType];
    const modules = this.moduleService[serviceProperty] as object;

    const loadList$ =
      Object.keys(modules).length === 0 ?
        from(this.moduleService.loadList()) :
        of(undefined);

    return loadList$.pipe(
      map(() => {
        const updatedModules = this.moduleService[serviceProperty] as object;
        return metadataKey ?
          VeronaModuleFactory.getBestMatch(
            metadataKey,
            Object.keys(updatedModules)
          ) :
          '';
      })
    );
  }

  getSchemerId(
    unitMetadataStore: UnitMetadataStore | undefined
  ): Observable<string> {
    return this.getVeronaModuleId(unitMetadataStore, 'schemer');
  }

  getPlayerId(
    unitMetadataStore: UnitMetadataStore | undefined
  ): Observable<string> {
    return this.getVeronaModuleId(unitMetadataStore, 'player');
  }

  getEditorId(
    unitMetadataStore: UnitMetadataStore | undefined
  ): Observable<string> {
    return this.getVeronaModuleId(unitMetadataStore, 'editor');
  }
}

import { lastValueFrom } from 'rxjs';
import { Injectable, signal } from '@angular/core';
import { VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import { VeronaModuleClass } from '../models/verona-module.class';
import { ModuleBackendService } from './module-backend.service';

/**
 * The Verona modules the installation has, kept by kind and looked up by key. Loaded once and held,
 * because every unit names the editor, player and schemer it is opened with and the list would
 * otherwise be fetched again for each of them.
 */
@Injectable({
  providedIn: 'root'
})

export class ModuleService {
  editors: { [key: string]: VeronaModuleClass } = {};
  players: { [key: string]: VeronaModuleClass } = {};
  schemers: { [key: string]: VeronaModuleClass } = {};
  widgets: { [key: string]: VeronaModuleClass } = {};
  // whether editors, players and schemers each hold a list that was loaded, now or by an earlier
  // load: empty maps alone do not tell an installation without modules from a failed request (#2135)
  private readonly loadedLists = new Set<string>();
  private readonly listLoadedState = signal(false);
  readonly listLoaded = this.listLoadedState.asReadonly();
  // counts the loads of the three lists that have finished: the maps are plain fields, and what is
  // computed from them reads this to be computed again when a reload replaces them (#2135)
  private readonly listVersionState = signal(0);
  readonly listVersion = this.listVersionState.asReadonly();
  // the load of the three lists that is running, for whoever asks meanwhile
  private loading: Promise<void> | undefined;

  constructor(
    private backendService: ModuleBackendService
  ) {}

  /**
   * Loads the lists of editors, players and schemers. A call while a load is running joins it rather
   * than asking the server again: the workspace, the properties and the unit check each ask as a unit
   * opens, at nearly the same time (#2135). A list that failed keeps the last one loaded, and
   * listLoaded stays set.
   */
  loadList(): Promise<void> {
    this.loading ??= this.fetchList().finally(() => {
      this.loading = undefined;
    });
    return this.loading;
  }

  private async fetchList(): Promise<void> {
    const [editorModules, playerModules, schemerModules] = await Promise.all([
      lastValueFrom(this.backendService.getModuleList('EDITOR')),
      lastValueFrom(this.backendService.getModuleList('PLAYER')),
      lastValueFrom(this.backendService.getModuleList('SCHEMER'))
    ]);

    // a list that failed keeps what was loaded before: a failed reload must not take the modules away
    if (editorModules) this.editors = this.loaded('EDITOR', editorModules);
    if (playerModules) this.players = this.loaded('PLAYER', playerModules);
    if (schemerModules) this.schemers = this.loaded('SCHEMER', schemerModules);
    this.listLoadedState.set(this.loadedLists.size === 3);
    this.listVersionState.update(version => version + 1);
  }

  private loaded(type: string, modules: VeronaModuleInListDto[]): { [key: string]: VeronaModuleClass } {
    this.loadedLists.add(type);
    return ModuleService.toModuleMap(modules);
  }

  async loadWidgets() {
    const widgetModules = await lastValueFrom(this.backendService.getModuleList('WIDGET'));
    this.widgets = ModuleService.toModuleMap(widgetModules);
  }

  private static toModuleMap(modules: VeronaModuleInListDto[] | null): { [key: string]: VeronaModuleClass } {
    const moduleMap: { [key: string]: VeronaModuleClass } = {};
    if (!modules) return moduleMap;
    modules.forEach(m => {
      const moduleObject = new VeronaModuleClass(m);
      moduleMap[moduleObject.key] = moduleObject;
    });
    return moduleMap;
  }

  async getModuleHtml(module: VeronaModuleClass): Promise<string> {
    if (module.html) return module.html;
    const fileData = await lastValueFrom(this.backendService.getModuleHtml(module.key));
    if (fileData) {
      module.html = fileData.file;
      return module.html;
    }
    return '';
  }
}

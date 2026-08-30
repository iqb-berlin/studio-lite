import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
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

  constructor(
    private backendService: ModuleBackendService
  ) {}

  async loadList() {
    const [editorModules, playerModules, schemerModules] = await Promise.all([
      lastValueFrom(this.backendService.getModuleList('EDITOR')),
      lastValueFrom(this.backendService.getModuleList('PLAYER')),
      lastValueFrom(this.backendService.getModuleList('SCHEMER'))
    ]);

    this.editors = ModuleService.toModuleMap(editorModules);
    this.players = ModuleService.toModuleMap(playerModules);
    this.schemers = ModuleService.toModuleMap(schemerModules);
  }

  async loadWidgets() {
    const widgetModules = await lastValueFrom(this.backendService.getModuleList('WIDGET'));
    this.widgets = ModuleService.toModuleMap(widgetModules);
  }

  private static toModuleMap(modules: VeronaModuleInListDto[]): { [key: string]: VeronaModuleClass } {
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

import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import { VeronaModuleClass } from '../models/verona-module.class';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root'
})

export class ModuleService {
  editors: { [key: string]: VeronaModuleClass } = {};
  players: { [key: string]: VeronaModuleClass } = {};
  schemers: { [key: string]: VeronaModuleClass } = {};
  widgets: { [key: string]: VeronaModuleClass } = {};

  constructor(
    private backendService: BackendService
  ) {}

  async loadList() {
    const [editorModules, playerModules, schemerModules] = await Promise.all([
      lastValueFrom(this.backendService.getModuleList('editor')),
      lastValueFrom(this.backendService.getModuleList('player')),
      lastValueFrom(this.backendService.getModuleList('schemer'))
    ]);

    this.editors = ModuleService.toModuleMap(editorModules);
    this.players = ModuleService.toModuleMap(playerModules);
    this.schemers = ModuleService.toModuleMap(schemerModules);
  }

  async loadWidgets() {
    const widgetModules = await lastValueFrom(this.backendService.getModuleList('widget'));
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

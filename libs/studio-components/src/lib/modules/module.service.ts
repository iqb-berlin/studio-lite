import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { VeronaModuleClass } from './verona-module.class';
import { BackendService } from '../backend.service';

@Injectable({
  providedIn: 'root'
})

export class ModuleService {
  editors: { [key: string]: VeronaModuleClass } = {};
  players: { [key: string]: VeronaModuleClass } = {};
  schemers: { [key: string]: VeronaModuleClass } = {};

  constructor(
    private backendService: BackendService
  ) {}

  async loadList() {
    const newEditors: { [key: string]: VeronaModuleClass } = {};
    const newPlayers: { [key: string]: VeronaModuleClass } = {};
    const newSchemers: { [key: string]: VeronaModuleClass } = {};
    const modules = await lastValueFrom(this.backendService.getModuleList());
    if (modules) {
      modules.forEach(m => {
        const moduleObject = new VeronaModuleClass(m);
        if (moduleObject.metadata.type === 'editor') {
          newEditors[moduleObject.key] = moduleObject;
        } else if (moduleObject.metadata.type === 'player') {
          newPlayers[moduleObject.key] = moduleObject;
        } else if (moduleObject.metadata.type === 'schemer') {
          newSchemers[moduleObject.key] = moduleObject;
        }
      });
    }
    this.editors = newEditors;
    this.players = newPlayers;
    this.schemers = newSchemers;
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

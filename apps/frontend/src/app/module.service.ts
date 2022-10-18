import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { VeronaModuleClass } from './classes/verona-module.class';
import { BackendService } from './backend.service';

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
    this.editors = {};
    this.players = {};
    this.schemers = {};
    this.backendService.getModuleList()
      .subscribe(moduleList => {
        moduleList.forEach(m => {
          const moduleObject = new VeronaModuleClass(m);
          if (moduleObject.metadata.type === 'editor') {
            this.editors[moduleObject.key] = moduleObject;
          } else if (moduleObject.metadata.type === 'player') {
            this.players[moduleObject.key] = moduleObject;
          } else if (moduleObject.metadata.type === 'schemer') {
            this.schemers[moduleObject.key] = moduleObject;
          }
        });
      });
  }

  async getHtml(module: VeronaModuleClass): Promise<string> {
    if (module.html) return module.html;
    const fileData = await lastValueFrom(this.backendService.getModuleHtml(module.key));
    if (fileData) {
      module.html = fileData.file;
      return module.html;
    }
    return '';
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

  emptyHtmls() {
    Object.keys(this.editors).forEach(k => {
      this.editors[k].html = '';
    });
    Object.keys(this.players).forEach(k => {
      this.players[k].html = '';
    });
    Object.keys(this.schemers).forEach(k => {
      this.schemers[k].html = '';
    });
  }
}

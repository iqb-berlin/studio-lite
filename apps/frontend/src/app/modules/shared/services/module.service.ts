import { lastValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { VeronaModuleClass } from '../models/verona-module.class';
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

  async loadList(): Promise<boolean> {
    try {
      const modules = await lastValueFrom(this.backendService.getModuleList());
      if (!modules) {
        return false;
      }

      const newModules: Record<'editor' | 'player' | 'schemer', { [key: string]: VeronaModuleClass }> = {
        editor: {},
        player: {},
        schemer: {}
      };

      modules.forEach(module => {
        const moduleObject = new VeronaModuleClass(module);
        const type = moduleObject.metadata.type;

        if (type === 'editor' || type === 'player' || type === 'schemer') {
          newModules[type][moduleObject.key] = moduleObject;
        }
      });

      this.editors = newModules.editor;
      this.players = newModules.player;
      this.schemers = newModules.schemer;

      return true;
    } catch (error) {
      console.error('Fehler beim Laden der Modul-Liste:', error);
      return false;
    }
  }

  async getModuleHtml(module: VeronaModuleClass): Promise<string> {
    if (module.html) {
      return module.html;
    }

    try {
      const fileData = await lastValueFrom(this.backendService.getModuleHtml(module.key));
      if (fileData?.file) {
        module.html = fileData.file; // HTML im Modul-Cache speichern
        return module.html;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Module-HTML:', error);
    }

    return '';
  }
}

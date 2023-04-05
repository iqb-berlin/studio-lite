import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ModuleService } from '@studio-lite/studio-components';
import { AppService } from '../services/app.service';

@Component({
  template: `
    <div fxLayout="column" style="height: 100%">
      <h1 mat-dialog-title>Einstellungen für den Arbeitsbereich</h1>
      <mat-dialog-content>
        <div fxLayout="column">
          <div fxLayout="row" fxLayoutAlign="space-between start">
                  <mat-label>Voreingestellter Editor</mat-label>
                  <app-select-module [modules]="this.moduleService.editors"
                                     [value]="dialogData.defaultEditor"
                                     (selectionChanged)="selectModul('editor', $event)"
                                     [stableOnly]="false"
                                     fxFlex="55%" moduleType="editor"></app-select-module>
          </div>
          <div fxLayout="row" fxLayoutAlign="space-between start">
                  <mat-label>Voreingestellter Player</mat-label>
                  <app-select-module [modules]="this.moduleService.players"
                                     [value]="dialogData.defaultPlayer"
                                     [stableOnly]="false"
                                     (selectionChanged)="selectModul('player', $event)"
                                     fxFlex="55%" moduleType="player"></app-select-module>
          </div>
          <div fxLayout="row" fxLayoutAlign="space-between start">
                  <mat-label>Voreingestellter Schemer</mat-label>
                  <app-select-module [modules]="this.moduleService.schemers"
                                     [value]="dialogData.defaultSchemer"
                                     [stableOnly]="false"
                                     (selectionChanged)="selectModul('schemer', $event)"
                                     fxFlex="55%" moduleType="schemer"></app-select-module>
          </div>
          <div fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="15px" class="margin-bottom">
            <mat-checkbox (click)="$event.stopPropagation()"
                          (change)="$event ? setStableChecked($event) : null"
                          [checked]="dialogData.stableModulesOnly">
            </mat-checkbox>
            <div>Nur Module zur Auswahl anzeigen, die als "stabil" markiert sind (keine Beta-Versionen).</div>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-raised-button color="primary" type="submit" [mat-dialog-close]="dialogData">
          Speichern
        </button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    '.margin-bottom {margin-bottom: 10px}'
  ]
})
export class EditWorkspaceSettingsComponent {
  dialogData: WorkspaceSettingsDto;

  constructor(
    public appService: AppService,
    public moduleService: ModuleService,
    @Inject(MAT_DIALOG_DATA) public data: unknown
  ) {
    this.dialogData = this.data as WorkspaceSettingsDto;
  }

  setStableChecked($event: MatCheckboxChange) {
    this.dialogData.stableModulesOnly = $event.checked;
  }

  selectModul(modulType: string, newValue: string) {
    if (modulType === 'editor') {
      this.dialogData.defaultEditor = newValue;
    } else if (modulType === 'schemer') {
      this.dialogData.defaultSchemer = newValue;
    } else if (modulType === 'player') {
      this.dialogData.defaultPlayer = newValue;
    }
  }
}

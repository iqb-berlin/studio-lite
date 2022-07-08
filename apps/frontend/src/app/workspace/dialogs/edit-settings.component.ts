import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-edit-settings',
  template: `
    <div fxLayout="column" style="height: 100%">
      <h1 mat-dialog-title>Einstellungen für den Arbeitsbereich</h1>
      <mat-dialog-content>
        <form [formGroup]="settingsForm" fxLayout="column">
          <mat-form-field>
            <mat-label>Voreingestellter Editor</mat-label>
            <mat-select placeholder="Editor" formControlName="editorSelector">
              <mat-option [value]=""></mat-option>
              <mat-option *ngFor="let m of ds.editorList.getEntries()" [value]="m.key">
                {{m.metadata?.name}} {{m.metadata?.version}}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Voreingestellter Player</mat-label>
            <mat-select placeholder="Player" formControlName="playerSelector">
              <mat-option [value]=""></mat-option>
              <mat-option *ngFor="let m of ds.playerList.getEntries()" [value]="m.key">
                {{m.metadata?.name}} {{m.metadata?.version}}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Voreingestellter Schemer</mat-label>
            <mat-select placeholder="Kodierung" formControlName="schemerSelector">
              <mat-option [value]=""></mat-option>
              <mat-option *ngFor="let m of ds.schemerList.getEntries()" [value]="m.key">
                {{m.metadata?.name}} {{m.metadata?.version}}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <div fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="15px" class="margin-bottom">
            <mat-checkbox formControlName="stableModulesOnlyCheckbox"></mat-checkbox>
            <div>Nur Module zur Auswahl anzeigen, die als "stabil" markiert sind (keine Beta-Versionen).</div>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-raised-button color="primary" type="submit" [mat-dialog-close]="settingsForm">
          Speichern</button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    '.margin-bottom {margin-bottom: 10px}'
  ]
})
export class EditSettingsComponent {
  settingsForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    public ds: WorkspaceService,
    @Inject(MAT_DIALOG_DATA) public data: unknown
  ) {
    this.settingsForm = this.fb.group({
      editorSelector: this.fb.control((this.data as WorkspaceSettingsDto).defaultEditor),
      playerSelector: this.fb.control((this.data as WorkspaceSettingsDto).defaultPlayer),
      schemerSelector: this.fb.control((this.data as WorkspaceSettingsDto).defaultSchemer),
      stableModulesOnlyCheckbox: this.fb.control((this.data as WorkspaceSettingsDto).stableModulesOnly)
    });
  }
}

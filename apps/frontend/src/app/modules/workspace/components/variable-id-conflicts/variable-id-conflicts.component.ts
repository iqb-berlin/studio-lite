import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import {
  MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflictDto } from '@studio-lite-lib/api-dto';

export interface UnitVariableIdConflicts {
  key: string;
  name?: string;
  conflicts: VariableIdConflictDto[];
}

/**
 * Names the chosen units whose export would carry one id for two variables -- a unit XML the
 * Testcenter (from version 19) rejects, a JSON whose readers mix the two up -- and says how to
 * resolve that by hand (#2119). Nothing is renamed here:
 * which of the two names is the right one only the authors know. Closes with true to export anyway.
 */
@Component({
  templateUrl: './variable-id-conflicts.component.html',
  styleUrls: ['./variable-id-conflicts.component.scss'],
  imports: [
    MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton,
    MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, TranslateModule
  ]
})
export class VariableIdConflictsComponent {
  // The way that keeps the derived name gives an element a new internal id; it needs an element
  readonly involvesElement: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    units: UnitVariableIdConflicts[];
    exportFormat: 'xml' | 'json';
  }) {
    this.involvesElement = data.units.some(unit => unit.conflicts
      .some(conflict => conflict.variables.some(variable => variable.kind === 'base')));
  }
}

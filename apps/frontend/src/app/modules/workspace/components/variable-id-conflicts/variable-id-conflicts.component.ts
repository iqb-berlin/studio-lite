import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflict } from '@studio-lite/shared-code';
import { VariableIdConflictListComponent } from '../variable-id-conflict-list/variable-id-conflict-list.component';
import { VariableIdConflictFixComponent } from '../variable-id-conflict-fix/variable-id-conflict-fix.component';

export interface UnitVariableIdConflicts {
  key: string;
  name?: string;
  conflicts: VariableIdConflict[];
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
    MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, TranslateModule,
    VariableIdConflictListComponent, VariableIdConflictFixComponent
  ]
})
export class VariableIdConflictsComponent {
  // the conflicts of all units, for the one description of how to resolve them
  readonly conflicts: VariableIdConflict[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    units: UnitVariableIdConflicts[];
    exportFormat: 'xml' | 'json';
  }) {
    this.conflicts = data.units.flatMap(unit => unit.conflicts);
  }
}

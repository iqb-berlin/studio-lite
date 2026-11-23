import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflict } from '@studio-lite/shared-code';
import { VariableIdConflictListComponent } from '../variable-id-conflict-list/variable-id-conflict-list.component';
import { VariableIdConflictFixComponent } from '../variable-id-conflict-fix/variable-id-conflict-fix.component';
import { UnitCheckFinding } from '../../utils/unit-check.utils';

/** A chosen unit with what is wrong with it before the export. */
export interface UnitExportProblems {
  key: string;
  name?: string;
  conflicts: VariableIdConflict[];
  /** What the schemer finds that makes the coding fail, as the unit check names it (#2135). */
  schemeProblems: UnitCheckFinding[];
}

/**
 * Names the chosen units whose export would go wrong, before it runs.
 * - Ids written twice (#2119): a unit XML the Testcenter (from version 19) rejects, a JSON whose
 *   readers mix the two up. How to resolve them by hand is described once, for all units.
 * - A coding the schemer rejects (#2135): coding with the exported scheme fails. Each problem says
 *   how to fix it, in the words of the unit check.
 *
 * Nothing is changed here: which name is the right one only the authors know. Closes with true to
 * export anyway.
 */
@Component({
  templateUrl: './export-problems.component.html',
  styleUrls: ['./export-problems.component.scss'],
  imports: [
    MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, TranslateModule,
    VariableIdConflictListComponent, VariableIdConflictFixComponent
  ]
})
export class ExportProblemsComponent {
  // the conflicts of all units, for the one description of how to resolve them
  readonly conflicts: VariableIdConflict[];
  readonly hasSchemeProblems: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    units: UnitExportProblems[];
    exportFormat: 'xml' | 'json';
  }) {
    this.conflicts = data.units.flatMap(unit => unit.conflicts);
    this.hasSchemeProblems = data.units.some(unit => unit.schemeProblems.length > 0);
  }
}

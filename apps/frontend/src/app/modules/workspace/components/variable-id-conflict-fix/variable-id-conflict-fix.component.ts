import { Component, computed, input } from '@angular/core';
import {
  MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflict } from '@studio-lite/shared-code';

/**
 * How to resolve by hand ids that the export would write twice (#2119). Nothing is renamed by the
 * studio: which of the two names is the right one only the authors know. Shown by the export
 * dialog and by the unit check (#2135).
 */
@Component({
  selector: 'studio-lite-variable-id-conflict-fix',
  templateUrl: './variable-id-conflict-fix.component.html',
  styleUrls: ['./variable-id-conflict-fix.component.scss'],
  imports: [MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, TranslateModule]
})
export class VariableIdConflictFixComponent {
  readonly conflicts = input.required<VariableIdConflict[]>();
  // The way that keeps the derived name gives an element a new internal id; it needs an element
  readonly involvesElement = computed(() => this.conflicts()
    .some(conflict => conflict.variables.some(variable => variable.kind === 'base')));
}

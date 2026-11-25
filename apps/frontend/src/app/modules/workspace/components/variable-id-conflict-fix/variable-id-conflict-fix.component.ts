import { Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflict } from '@studio-lite/shared-code';

const hasElement = (conflict: VariableIdConflict) => conflict.variables.some(variable => variable.kind === 'base');
const hasDerived = (conflict: VariableIdConflict) => conflict.variables.some(variable => variable.kind === 'derived');

/**
 * How to resolve by hand ids that the export would write twice (#2119). Nothing is renamed by the
 * studio: which of the two names is the right one only the authors know. Shown by the export
 * dialog and by the unit check (#2135).
 */
@Component({
  selector: 'studio-lite-variable-id-conflict-fix',
  templateUrl: './variable-id-conflict-fix.component.html',
  styleUrls: ['./variable-id-conflict-fix.component.scss'],
  imports: [MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, NgTemplateOutlet, TranslateModule]
})
export class VariableIdConflictFixComponent {
  readonly conflicts = input.required<VariableIdConflict[]>();
  // The way that keeps the derived name gives the element a new internal id; it needs both
  readonly elementAndDerived = computed(() => this.conflicts()
    .some(conflict => hasElement(conflict) && hasDerived(conflict)));

  // Two elements of one internal id, copied with it: one of them gets a new one, the same way (#2135)
  readonly elementsOnly = computed(() => this.conflicts().some(conflict => !hasDerived(conflict)));

  // Renaming the derived variable needs one
  readonly involvesDerived = computed(() => this.conflicts().some(hasDerived));
}

import { Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflict } from '@studio-lite/shared-code';

/** A text of the list: its translation key and the names it is filled with. */
interface ConflictText {
  key: string;
  params: Record<string, string>;
}

/** One conflict as the list words it: the id, and a line for each variable it would stand for. */
interface ConflictLines {
  id: string;
  heading: ConflictText;
  variables: ConflictText[];
}

/**
 * The ids of one unit that the export would write for two variables, each variable named as the
 * authors see it: an element by the alias the editor shows, not by the internal id nobody sees
 * there (#2119). Shown by the export dialog and by the technical validation (#2135).
 *
 * Each line is one whole sentence with the names in it, as the translations require: the word order
 * around a name differs between languages.
 */
@Component({
  selector: 'studio-lite-variable-id-conflict-list',
  templateUrl: './variable-id-conflict-list.component.html',
  styleUrls: ['./variable-id-conflict-list.component.scss'],
  imports: [TranslateModule]
})
export class VariableIdConflictListComponent {
  readonly conflicts = input.required<VariableIdConflict[]>();

  readonly lines = computed((): ConflictLines[] => this.conflicts().map(conflict => ({
    id: conflict.id,
    heading: { key: 'variable-id-conflicts.stands-for', params: { id: conflict.id } },
    variables: conflict.variables.map(variable => ({
      key: variable.kind === 'base' ? 'variable-id-conflicts.base' : 'variable-id-conflicts.derived',
      params: { name: variable.alias || variable.id }
    }))
  })));
}

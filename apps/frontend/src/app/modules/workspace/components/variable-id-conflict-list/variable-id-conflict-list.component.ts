import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { VariableIdConflict } from '@studio-lite/shared-code';

/**
 * The ids of one unit that the export would write for two variables, each variable named as the
 * authors see it: an element by the alias the editor shows, not by the internal id nobody sees
 * there (#2119). Shown by the export dialog and by the unit check (#2135).
 */
@Component({
  selector: 'studio-lite-variable-id-conflict-list',
  templateUrl: './variable-id-conflict-list.component.html',
  styleUrls: ['./variable-id-conflict-list.component.scss'],
  imports: [TranslateModule]
})
export class VariableIdConflictListComponent {
  readonly conflicts = input.required<VariableIdConflict[]>();
}

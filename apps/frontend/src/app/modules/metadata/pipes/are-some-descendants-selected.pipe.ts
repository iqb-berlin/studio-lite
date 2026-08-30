import { Pipe, PipeTransform } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { VocabFlatNode } from '../models/vocabulary.class';
import { AreAllDescendantsSelectedPipe } from './are-all-descendants-selected.pipe';

/**
 * Whether some but not all nodes below this one are selected -- the indeterminate state of a parent
 * checkbox, which is why "all" is excluded here. See {@link AreAllDescendantsSelectedPipe} for the
 * `trigger` argument.
 */
@Pipe({
  name: 'areSomeDescendantsSelected',
  standalone: true
})
export class AreSomeDescendantsSelectedPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(treeControl: FlatTreeControl<VocabFlatNode, VocabFlatNode>,
            checklistSelection: SelectionModel<VocabFlatNode>,
            node: VocabFlatNode,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            trigger: boolean): boolean {
    return AreSomeDescendantsSelectedPipe.check(treeControl, checklistSelection, node);
  }

  static check(treeControl: FlatTreeControl<VocabFlatNode, VocabFlatNode>,
               checklistSelection: SelectionModel<VocabFlatNode>,
               node: VocabFlatNode): boolean {
    const descendants = treeControl.getDescendants(node);
    const result = descendants.some(child => checklistSelection.isSelected(child));
    return result &&
      !AreAllDescendantsSelectedPipe.check(treeControl, checklistSelection, node);
  }
}

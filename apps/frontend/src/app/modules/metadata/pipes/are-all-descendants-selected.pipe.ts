import { Pipe, PipeTransform } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { VocabFlatNode } from '../models/vocabulary.class';

/**
 * Whether every node below this one in the vocabulary tree is selected -- the checked state of a
 * parent checkbox. A leaf has no descendants and is never "all selected".
 *
 * The `trigger` argument is not read: the tree control and the selection are mutated in place, so a
 * pure pipe needs a value that changes to re-run at all.
 */
@Pipe({
  name: 'areAllDescendantsSelected',
  standalone: true
})
export class AreAllDescendantsSelectedPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(treeControl: FlatTreeControl<VocabFlatNode, VocabFlatNode>,
            checklistSelection: SelectionModel<VocabFlatNode>,
            node: VocabFlatNode,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            trigger: boolean): boolean {
    return AreAllDescendantsSelectedPipe.check(treeControl, checklistSelection, node);
  }

  static check(treeControl: FlatTreeControl<VocabFlatNode, VocabFlatNode>,
               checklistSelection: SelectionModel<VocabFlatNode>,
               node: VocabFlatNode): boolean {
    const descendants = treeControl.getDescendants(node);
    return descendants.length > 0 &&
      descendants.every(child => checklistSelection.isSelected(child));
  }
}

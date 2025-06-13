import { Pipe, PipeTransform } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { VocabFlatNode } from '../models/vocabulary.class';

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

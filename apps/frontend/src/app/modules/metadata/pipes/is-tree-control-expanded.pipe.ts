import { Pipe, PipeTransform } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { VocabFlatNode } from '../models/vocabulary.class';

/**
 * Whether this node of the vocabulary tree is unfolded. See {@link AreAllDescendantsSelectedPipe}
 * for why a `trigger` is passed in.
 */
@Pipe({
  name: 'isTreeControlExpanded',
  standalone: true
})
export class IsTreeControlExpandedPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(treeControl: FlatTreeControl<VocabFlatNode, VocabFlatNode>,
            node: VocabFlatNode,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            trigger: boolean): boolean {
    return treeControl.isExpanded(node);
  }
}

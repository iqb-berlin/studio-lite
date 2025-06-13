import { Pipe, PipeTransform } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { VocabFlatNode } from '../models/vocabulary.class';

@Pipe({
  name: 'isNodeSelected',
  standalone: true
})
export class IsNodeSelectedPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(checklistSelection: SelectionModel<VocabFlatNode>,
            node: VocabFlatNode,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            trigger: boolean): boolean {
    return checklistSelection.isSelected(node);
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';

/**
 * Whether a row is selected. Beside the model it takes `selection.selected`, which the model
 * builds anew after every change -- that is what makes the pure pipe run again, since the model is
 * mutated in place. The count of selected rows did not do: a selection replaced by another of the
 * same size left the old rows ticked (#433).
 */
@Pipe({
  name: 'isSelected',
  standalone: true
})
export class IsSelectedPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform<T>(
    selectionModel: SelectionModel<T>,
    element: T,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selected: readonly T[]
  ): boolean {
    return selectionModel.isSelected(element);
  }
}

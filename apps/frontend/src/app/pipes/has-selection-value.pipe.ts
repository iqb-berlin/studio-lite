import { Pipe, PipeTransform } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';

/**
 * Whether a selection holds anything. The count is passed in beside the model and changes with
 * every selection -- without it the pure pipe would never re-run, because the SelectionModel is
 * mutated in place and keeps its reference.
 */
@Pipe({
  name: 'hasSelectionValue',
  standalone: true
})
export class HasSelectionValuePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-explicit-any
  transform(selectionModel: SelectionModel<any>, selectionLength: number): boolean {
    return !!selectionLength && selectionModel.hasValue();
  }
}

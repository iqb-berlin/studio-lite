import { Pipe, PipeTransform } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';

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

import { Pipe, PipeTransform } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';

@Pipe({
  name: 'isSelected',
  standalone: true
})
export class IsSelectedPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-explicit-any
  transform(selectionModel: SelectionModel<any>, element: any, selectionCount: number): boolean {
    return !!selectionCount && selectionModel.isSelected(element);
  }
}

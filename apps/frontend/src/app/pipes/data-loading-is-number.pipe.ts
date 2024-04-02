import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataLoadingIsNumber',
  standalone: true
})
export class DataLoadingIsNumberPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(dataLoading: boolean | number): boolean {
    return typeof dataLoading === 'number';
  }
}

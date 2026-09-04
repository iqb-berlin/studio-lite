import { Pipe, PipeTransform } from '@angular/core';

/** Whether a loading state carries a number, i.e. whether a progress bar can show it. */
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

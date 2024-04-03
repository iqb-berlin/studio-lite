import { Pipe, PipeTransform } from '@angular/core';
import { PrintOptions } from '../../print/models/print-options.interface';

@Pipe({
  name: 'isActivePrintOption',
  standalone: true
})
export class IsActivePrintOption implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(printOptions: PrintOptions[], key: string): boolean {
    return printOptions
      .find(option => option.key === key)?.value as boolean || false;
  }
}

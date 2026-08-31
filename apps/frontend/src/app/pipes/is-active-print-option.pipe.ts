import { Pipe, PipeTransform } from '@angular/core';
import { PrintOptions } from '../modules/print/models/print-options.interface';

/** Whether the print option with this key is switched on; an unknown key counts as off. */
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

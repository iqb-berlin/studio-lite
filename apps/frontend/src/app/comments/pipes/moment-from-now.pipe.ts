import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'momentFromNow'
})
export class MomentFromNowPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(date: Date): string {
    return moment(date).fromNow();
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** An hour of the day as a full-hour time ("09:00 Uhr"), for the axis of the admin's activity view. */
@Pipe({
  name: 'toTime',
  standalone: true
})
export class ToTimePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(value: number): string {
    const hour = value.toString(10).padStart(2, '0');
    return `${hour}:00 ${this.translateService.instant('hour')}`;
  }
}

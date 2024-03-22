import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

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

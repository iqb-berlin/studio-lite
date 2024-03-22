import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'dataLoadingAsText',
    standalone: true
})
export class DataLoadingAsTextPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(dataLoading: boolean | number): string {
    if (typeof dataLoading === 'number') {
      const progressValue = dataLoading as number;
      if (progressValue <= 100) return `${progressValue} %`;
      if (progressValue < 8000) return `${(progressValue / 1024).toFixed(1)} kB`;
      return `${(progressValue / 1048576).toFixed(1)} MB`;
    }
    return this.translateService.instant('application.wait-message');
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'unitDropBoxTooltip',
  standalone: true
})
export class UnitDropBoxTooltipPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  // eslint-disable-next-line class-methods-use-this
  transform(element: UnitInListDto): string {
    if (!element.sourceWorkspaceId) return '';
    const key = (element.returned ? 'workspace.unit-returned' : 'workspace.unit-submitted');
    return this.translateService.instant(key);
  }
}

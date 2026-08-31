import { Pipe, PipeTransform } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';

/**
 * The tooltip on a unit's drop-box marking: whether it was submitted or sent back. A unit that was
 * never submitted has no marking and no tooltip.
 */
@Pipe({
  name: 'unitDropBoxTooltip',
  standalone: true
})
export class UnitDropBoxTooltipPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  // eslint-disable-next-line class-methods-use-this
  transform(element: UnitInListDto): string {
    if (!element.sourceWorkspaceId) return '';
    const key = (element.returned ? 'workspace.returned-unit' : 'workspace.submitted-unit');
    return this.translateService.instant(key);
  }
}

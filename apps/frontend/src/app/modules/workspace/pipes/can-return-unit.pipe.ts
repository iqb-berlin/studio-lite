import { Pipe, PipeTransform } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';

@Pipe({
  name: 'canReturnUnit',
  standalone: true
})
export class CanReturnUnitPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(unitId: number, unitList: { [key: string]: UnitInListDto[] }): boolean {
    const unit = Object.values(unitList).flat().find(u => u.id === unitId);
    if (unit) return !!unit.sourceWorkspaceId;
    return false;
  }
}

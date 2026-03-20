import { Pipe, PipeTransform } from '@angular/core';
import { UnitItemDto } from '@studio-lite-lib/api-dto';

@Pipe({
  name: 'getItemLabel',
  standalone: true,
  pure: true
})
export class GetItemLabelPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(uuid: string, items: UnitItemDto[]): string {
    if (!items || !uuid) return uuid;
    const item = items.find(i => i.uuid === uuid);
    return item?.id || uuid;
  }
}

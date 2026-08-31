import { Pipe, PipeTransform } from '@angular/core';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';

/**
 * Pairs the item uuids a comment points at with the ids those items carry in their unit, so the
 * comment can name them the way the unit does. An item without an id is shown as such rather than
 * as a bare uuid.
 */
@Pipe({
  name: 'mapItemUuidsIds',
  standalone: true
})

export class MapItemUuidsIdsPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(itemUuids: string[], unitItems: UnitItemDto[]): { uuid: string, id: string }[] {
    return itemUuids.map(uuid => ({ uuid: uuid, id: this.getItemId(uuid, unitItems) }));
  }

  private getItemId(uuid: string, unitItems: UnitItemDto[]): string {
    const item = unitItems.find(i => i.uuid === uuid);
    return item && item.id ? item.id : this.translateService.instant('metadata.without-id');
  }
}

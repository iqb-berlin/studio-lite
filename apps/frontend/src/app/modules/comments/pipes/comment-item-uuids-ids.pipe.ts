import { Pipe, PipeTransform } from '@angular/core';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'commentItemUuidsIds',
  standalone: true
})

export class CommentItemUuidsIdsPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(itemUuids: string[], unitItems: UnitItemDto[]): { uuid: string, id: string }[] {
    return itemUuids.map(uuid => ({ uuid: uuid, id: this.getItemId(uuid, unitItems) }));
  }

  private getItemId(uuid: string, unitItems: UnitItemDto[]): string {
    const item = unitItems.find(i => i.uuid === uuid);
    return item && item.id ? item.id : this.translateService.instant('metadata.without-id');
  }
}

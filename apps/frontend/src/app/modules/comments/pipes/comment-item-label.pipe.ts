import { Pipe, PipeTransform } from '@angular/core';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'commentItemLabel',
  standalone: true
})

export class CommentItemLabelPipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  // eslint-disable-next-line class-methods-use-this
  transform(itemUuid: string, unitItems: UnitItemDto[]): string {
    return unitItems
      .find(item => item.uuid === itemUuid)?.id || this.translateService
      .instant('metadata.without-id');
  }
}

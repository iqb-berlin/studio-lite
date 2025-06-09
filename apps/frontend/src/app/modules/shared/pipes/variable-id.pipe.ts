import { Pipe, PipeTransform } from '@angular/core';
import { AliasId } from '../../metadata/models/alias-id.interface';

@Pipe({
  name: 'variableId',
  standalone: true
})
export class VariableIdPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(id: string | undefined | null, alias: string | undefined | null, aliasIds: AliasId[] | undefined): string {
    if (aliasIds && id) {
      const aliasId = aliasIds.find(v => v.id === id);
      if (aliasId) {
        return aliasId.alias;
      }
    }
    return alias || '-';
  }
}

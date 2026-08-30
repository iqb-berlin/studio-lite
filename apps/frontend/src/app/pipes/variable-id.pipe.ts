import { Pipe, PipeTransform } from '@angular/core';
import { AliasId } from '../modules/metadata/models/alias-id.interface';

/**
 * What to show for a variable: its alias from the unit's own list of alias ids if there is one,
 * otherwise the alias handed in, and a dash when there is nothing to show at all. A variable is
 * referred to by its alias everywhere a person reads it -- the id is the technical name.
 */
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

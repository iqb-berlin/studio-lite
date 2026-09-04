import { Pipe, PipeTransform } from '@angular/core';
import { State } from '../../admin/models/state.type';

/**
 * The label or the colour of a unit state. The states themselves are configured per workspace
 * group, so they are handed in rather than known here; an unknown state yields an empty string.
 */
@Pipe({
  name: 'state',
  standalone: true
})
export class StatePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(id: string, property: 'label' | 'color', states: State[]): string {
    if (states) {
      const filteredState = states
        .filter((state: State) => Number(id) === state.id);
      if (filteredState.length) {
        return filteredState[0][property];
      }
    }
    return '';
  }
}

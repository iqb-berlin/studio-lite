import { Pipe, PipeTransform } from '@angular/core';
import { State } from '../../admin/models/state.type';

@Pipe({
  name: 'stateColor',
  standalone: true
})
export class StateColorPipe implements PipeTransform {
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

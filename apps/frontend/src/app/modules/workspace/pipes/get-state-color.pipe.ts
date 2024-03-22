import { Pipe, PipeTransform } from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { State } from '../../admin/models/state.type';

@Pipe({
    name: 'getStateColor',
    standalone: true
})
export class GetStateColorPipe implements PipeTransform {
  constructor(
    public workspaceService: WorkspaceService
  ) {}

  // eslint-disable-next-line class-methods-use-this
  transform(id: string, property:string, states: State[]): any {
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

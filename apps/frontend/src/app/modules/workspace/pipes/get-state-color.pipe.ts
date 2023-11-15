import { Pipe, PipeTransform } from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { State } from '../../admin/models/state.type';

@Pipe({
  name: 'getStateColor'
})
export class GetStateColorPipe implements PipeTransform {
  constructor(
    public workspaceService: WorkspaceService
  ) {}

  // eslint-disable-next-line class-methods-use-this
  async transform(id: string, property:string) {
    const states = await this.workspaceService.getWorkspaceGroupStates() || [];
    const filteredState = states.filter((state:State) => Number(id) === state.id);
    if (filteredState.length) { return filteredState[0][property]; } return '';
  }
}

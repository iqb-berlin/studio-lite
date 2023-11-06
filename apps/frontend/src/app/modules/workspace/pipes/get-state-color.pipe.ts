import { Pipe, PipeTransform } from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';

@Pipe({
  name: 'getStateColor'
})
export class GetStateColorPipe implements PipeTransform {
  constructor(
    public workspaceService: WorkspaceService
  ) {}

  // eslint-disable-next-line class-methods-use-this
  transform(id: string) {
    const states = this.workspaceService.workspaceSettings.states || [];
    const state = states[Number(id) - 1];
    if (state) { return state?.color; } return '';
  }
}

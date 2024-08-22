import { Pipe, PipeTransform } from '@angular/core';
import { WorkspaceInListDto } from '@studio-lite-lib/api-dto';

@Pipe({
  name: 'workspaceName',
  standalone: true
})
export class WorkspaceNamePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(id: number, workspaces: WorkspaceInListDto[]): string {
    return workspaces.find(workspace => workspace.id === id)?.name || '';
  }
}

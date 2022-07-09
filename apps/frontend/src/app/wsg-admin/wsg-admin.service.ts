import { Injectable } from '@angular/core';
import { WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';

@Injectable({
  providedIn: 'root'
})
export class WsgAdminService {
  public selectedWorkspaceGroupId = 0;
  public selectedWorkspaceGroupName = '';
  public selectedWorkspaceGroupSettings: WorkspaceGroupSettingsDto = {
    defaultSchemer: '',
    defaultPlayer: '',
    defaultEditor: ''
  };
}

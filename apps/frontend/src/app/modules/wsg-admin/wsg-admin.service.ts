import { Injectable } from '@angular/core';
import { WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';

@Injectable({
  providedIn: 'root'
})
export class WsgAdminService {
  selectedWorkspaceGroupId = 0;
  selectedWorkspaceGroupName = '';
  selectedWorkspaceGroupSettings: WorkspaceGroupSettingsDto = {
    defaultSchemer: '',
    defaultPlayer: '',
    defaultEditor: ''
  };
}

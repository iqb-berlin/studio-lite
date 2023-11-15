import { Injectable } from '@angular/core';
import { WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { MDProfile, MDProfileStore } from '@iqb/metadata';

export type ProfileStoreWithProfiles = {
  profileStore:MDProfileStore,
  profiles: MDProfile[]
};
@Injectable({
  providedIn: 'root'
})
export class WsgAdminService {
  settingsChanged: boolean = false;
  profileStores: ProfileStoreWithProfiles[] = [];
  selectedWorkspaceGroupId = 0;
  selectedWorkspaceGroupName = '';
  selectedWorkspaceGroupSettings: WorkspaceGroupSettingsDto = {
    defaultSchemer: '',
    defaultPlayer: '',
    defaultEditor: ''
  };
}

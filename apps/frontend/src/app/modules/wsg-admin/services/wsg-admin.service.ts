import { Inject, Injectable } from '@angular/core';
import { WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { MDProfile } from '@iqbspecs/metadata-profile';
import { MDProfileStore } from '@iqbspecs/metadata-store/metadata-store.interface';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export type ProfileStoreWithProfiles = {
  profileStore:MDProfileStore,
  profiles: MDProfile[]
};
/**
 * The state of the workspace group being administered: its settings, and the metadata profiles its
 * workspaces may choose from. What a group admin edits here reaches every unit in the group.
 */
@Injectable({
  providedIn: 'root'
})
export class WsgAdminService {
  settingsChanged: boolean = false;
  profileStores: ProfileStoreWithProfiles[] = [];
  selectedWorkspaceGroupId: BehaviorSubject<number> = new BehaviorSubject(0);
  selectedWorkspaceGroupName: BehaviorSubject<string> = new BehaviorSubject('');
  selectedWorkspaceGroupSettings: BehaviorSubject<WorkspaceGroupSettingsDto> = new BehaviorSubject({
    defaultSchemer: '',
    defaultPlayer: '',
    defaultEditor: ''
  });

  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  setWorkspaceGroupSettings(workspaceGroupId: number, settings:WorkspaceGroupSettingsDto):Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspace-groups/${workspaceGroupId}`, {
        id: workspaceGroupId,
        settings: settings
      })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}

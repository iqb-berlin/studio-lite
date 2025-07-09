import { Inject, Injectable } from '@angular/core';
import { WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { MDProfile, MDProfileStore } from '@iqb/metadata';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

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
  selectedWorkspaceGroupId: BehaviorSubject<number> = new BehaviorSubject(0);
  selectedWorkspaceGroupName: BehaviorSubject<string> = new BehaviorSubject('');
  selectedWorkspaceGroupSettings: WorkspaceGroupSettingsDto = {
    defaultSchemer: '',
    defaultPlayer: '',
    defaultEditor: ''
  };

  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  setWorkspaceGroupSettings(workspaceGroupId: number, settings:WorkspaceGroupSettingsDto):Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspace-groups/${workspaceGroupId}`, { id: workspaceGroupId, settings: settings })
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }
}

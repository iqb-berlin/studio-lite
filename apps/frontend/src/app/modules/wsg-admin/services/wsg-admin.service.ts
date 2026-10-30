import { Inject, Injectable, signal } from '@angular/core';
import { WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { MDProfile } from '@iqbspecs/metadata-profile';
import { MDProfileStore } from '@iqbspecs/metadata-store/metadata-store.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { succeeded } from '../../../utils/succeeded.utils';

export type ProfileStoreWithProfiles = {
  profileStore: MDProfileStore,
  profiles: MDProfile[]
};

export type SettingsLoad = 'loading' | 'loaded' | 'failed';
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

  // Until the group's settings are loaded, the ones above are substitutes, the default or another group's.
  // Saved, the API would lay them over the stored settings (#2010).
  private readonly settingsLoadState = signal<SettingsLoad>('loading');
  readonly settingsLoad = this.settingsLoadState.asReadonly();

  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  setSettingsLoad(load: SettingsLoad): void {
    this.settingsLoadState.set(load);
  }

  setWorkspaceGroupSettings(workspaceGroupId: number, settings:WorkspaceGroupSettingsDto):Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspace-groups/${workspaceGroupId}`, {
        id: workspaceGroupId,
        settings: settings
      })
      .pipe(succeeded());
  }
}

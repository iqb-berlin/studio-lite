import {
  Component, OnInit, Output, EventEmitter, Input
} from '@angular/core';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { MDProfileStore, MDProfile } from '@iqb/metadata';
import { TranslateModule } from '@ngx-translate/core';
import { MatError } from '@angular/material/form-field';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatDialogTitle } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ProfileStoreWithProfiles, WsgAdminService } from '../../../wsg-admin/services/wsg-admin.service';
import { Profile } from '../../models/profile.type';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';

export type CoreProfile = Omit<MDProfile, 'groups'>;

@Component({
  selector: 'studio-lite-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  imports: [MatProgressSpinner, MatDialogTitle, FormsModule, MatExpansionPanel,
    MatExpansionPanelHeader, MatExpansionPanelTitle, MatCheckbox, MatError, TranslateModule]
})
export class ProfilesComponent implements OnInit {
  isLoading: boolean = false;
  isError: boolean = false;
  ProfileStoreWithProfilesCollection : ProfileStoreWithProfiles[] = [];
  fetchedProfiles: CoreProfile[] = [];
  profilesSelected : CoreProfile[] = [];
  profile!:Profile;

  @Output() hasChanged = new EventEmitter<Array<CoreProfile>>();
  @Input() profiles!: Profile[];
  constructor(
    private wsgAdminService: WsgAdminService,
    private workspaceBackendService: WorkspaceBackendService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadProfiles();
  }

  private loadProfiles(): void {
    this.isLoading = true;
    this.workspaceBackendService.getRegisteredProfiles()
      .subscribe(registeredProfiles => {
        if (registeredProfiles && registeredProfiles !== true) {
          registeredProfiles.forEach(async registeredProfile => {
            const ProfilesStore = new MDProfileStore(registeredProfile);
            const profiles: (MDProfile | null)[] = await Promise.all(ProfilesStore.profiles.map(profile => {
              const afterWith = (registeredProfile.url.slice(0, registeredProfile.url.lastIndexOf('/')));
              return this.getProfile(`${afterWith}/${profile}`);
            }));
            this.ProfileStoreWithProfilesCollection.push({
              profileStore: ProfilesStore,
              profiles: profiles
                .filter(profile => !!profile)
                .map(profile => profile as MDProfile)
            });
          });
          this.wsgAdminService.profileStores = this.ProfileStoreWithProfilesCollection;
          this.fetchedProfiles = this.wsgAdminService.selectedWorkspaceGroupSettings.profiles || this.profiles;
          this.profilesSelected = this.fetchedProfiles || [];
          this.isLoading = false;
          this.isError = false;
        } else {
          this.isLoading = false;
          this.isError = true;
        }
      });
  }

  async getProfile(profileUrl:string): Promise<MDProfile | null> {
    return new Promise(resolve => {
      this.workspaceBackendService.getMetadataProfile(profileUrl)
        .subscribe(profile => {
          if (profile) {
            return resolve(new MDProfile(profile));
          }
          return resolve(null);
        });
    });
  }

  isChecked(id:string):boolean {
    return !!this.profilesSelected?.find((profile: { id: string; }) => profile.id === id);
  }

  changeSelection(checkbox:MatCheckboxChange) {
    checkbox.checked ?
      this.profilesSelected.push(
        { id: checkbox.source.id || '', label: checkbox.source.name || '' }) :
      this.profilesSelected = this.profilesSelected
        .filter((profile: CoreProfile) => profile.id !== checkbox.source.id);
    this.hasChanged.emit(this.profilesSelected);
  }
}

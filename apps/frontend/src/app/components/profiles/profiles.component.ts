import {
  Component, OnInit, Output, EventEmitter, Input
} from '@angular/core';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { MDProfileStore, MDProfile } from '@iqb/metadata';
import { TranslateModule } from '@ngx-translate/core';
import { MatError } from '@angular/material/form-field';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ProfileStoreWithProfiles, WsgAdminService } from '../../modules/wsg-admin/services/wsg-admin.service';
import { Profile } from '../../models/profile.type';
import { MetadataBackendService } from '../../modules/metadata/services/metadata-backend.service';

export type CoreProfile = Omit<MDProfile, 'groups'>;

@Component({
  selector: 'studio-lite-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  imports: [MatProgressSpinner, FormsModule, MatExpansionPanel,
    MatExpansionPanelHeader, MatExpansionPanelTitle, MatCheckbox, MatError, TranslateModule]
})
export class ProfilesComponent implements OnInit {
  isLoading: boolean = false;
  isError: boolean = false;
  profileStoresWithProfiles : ProfileStoreWithProfiles[] = [];
  fetchedProfiles: CoreProfile[] = [];
  profilesSelected : CoreProfile[] = [];
  profile!:Profile;

  @Output() hasChanged = new EventEmitter<Array<CoreProfile>>();
  @Input() profiles!: Profile[];

  constructor(
    private wsgAdminService: WsgAdminService,
    private backendService: MetadataBackendService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadProfiles();
  }

  private loadProfiles(): void {
    this.isLoading = true;
    this.backendService.getRegisteredProfiles()
      .subscribe(async registeredProfiles => {
        if (Array.isArray(registeredProfiles)) {
          this.profileStoresWithProfiles = await Promise.all(
            registeredProfiles.map(async registeredProfile => {
              const ProfilesStore = new MDProfileStore(registeredProfile);
              const profiles = await Promise.all(
                ProfilesStore.profiles.map(profile => {
                  const afterWith = registeredProfile.url.slice(0, registeredProfile.url.lastIndexOf('/'));
                  return this.getProfile(`${afterWith}/${profile}`);
                })
              );
              return {
                profileStore: ProfilesStore,
                profiles: profiles.filter(p => !!p) as MDProfile[]
              };
            })
          );
          this.wsgAdminService.profileStores = this.profileStoresWithProfiles;
          const currentSettings = this.wsgAdminService.selectedWorkspaceGroupSettings.getValue();
          this.fetchedProfiles = currentSettings.profiles || this.profiles;
          this.profilesSelected = this.fetchedProfiles || [];
          this.isError = false;
        } else {
          this.isError = true;
        }
        this.isLoading = false;
      });
  }

  async getProfile(profileUrl:string): Promise<MDProfile | null> {
    return new Promise(resolve => {
      this.backendService.getMetadataProfile(profileUrl)
        .subscribe(profile => {
          if (profile && profile !== true) {
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

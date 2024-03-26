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

// eslint-disable-next-line import/no-cycle
import { Profile } from '../../../admin/components/workspace-groups/workspace-groups.component';
import { ProfileStoreWithProfiles, WsgAdminService } from '../../../wsg-admin/services/wsg-admin.service';

export type CoreProfile = Omit<MDProfile, 'groups'>;

@Component({
  selector: 'studio-lite-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatProgressSpinner, MatDialogTitle, FormsModule, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatCheckbox, MatError, TranslateModule]
})
export class ProfilesComponent implements OnInit {
  isLoading: boolean = false;
  isError: boolean = false;
  PROFILE_REGISTRY = 'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv';
  storesURLs: string[] = [];
  ProfileStoreWithProfilesCollection : ProfileStoreWithProfiles[] = [];
  fetchedProfiles: CoreProfile[] = [];
  profilesSelected : CoreProfile[] = [];
  profile!:Profile;

  @Output() hasChanged = new EventEmitter<Array<CoreProfile>>();
  @Input() profiles!: Profile[];
  constructor(
    private wsgAdminService: WsgAdminService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.readCsv();
    this.fetchedProfiles = this.wsgAdminService.selectedWorkspaceGroupSettings.profiles || this.profiles;
    this.profilesSelected = this.fetchedProfiles || [];
  }

  async readCsv() {
    try {
      const profileRegistryResponse = await fetch(this.PROFILE_REGISTRY);
      if (profileRegistryResponse.ok) {
        this.isLoading = true;
        const profileRegistry = await profileRegistryResponse.text();
        this.csvToProfileURLs(profileRegistry, '"');
        // eslint-disable-next-line no-restricted-syntax
        for await (const url of this.storesURLs) {
          const response = await fetch(url);
          if (response.ok) {
            const store = await response.json();
            if (store) {
              const ProfilesStore = new MDProfileStore(store);
              const profiles:MDProfile[] = [];
              // eslint-disable-next-line no-restricted-syntax
              for await (const profile of ProfilesStore.profiles) {
                const afterWith = (url.slice(0, url.lastIndexOf('/')));
                const pro = await this.getProfile(`${afterWith}/${profile}`);
                profiles.push(pro as MDProfile);
              }
              this.ProfileStoreWithProfilesCollection.push({
                profileStore: ProfilesStore,
                profiles: profiles
              });
            }
          }
          this.wsgAdminService.profileStores = this.ProfileStoreWithProfilesCollection;
          this.isLoading = false;
        }
      }
    } catch (err) {
      this.isError = true;
      this.isLoading = false;
    }
  }

  csvToProfileURLs(stringVal:string, splitter:string) {
    const [, ...rest] = stringVal
      .trim()
      .split('\n')
      .map(item => item.split(splitter));
    const storesArray = rest.map(e => e.filter(el => (el !== ',' && el !== '')));
    const storesURLs: any = [];
    storesArray.forEach(store => {
      const sanitizedURL = store[2].replace(',', '');
      storesURLs.push(sanitizedURL);
    });
    this.storesURLs = storesURLs;
  }

  async getProfile(profileURL:string) {
    try {
      const response = await fetch(`${profileURL}`);
      if (response.ok) {
        const data = await response.json();
        this.profile = new MDProfile(data);
        return this.profile;
      }
      return [];
    } catch {
      this.isError = true;
      this.isLoading = false;
      return [];
    }
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

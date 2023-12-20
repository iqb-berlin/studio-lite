import {
  Component, OnInit, Output, EventEmitter
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MDProfileStore, MDProfile } from '@iqb/metadata';
import { WsgAdminService, ProfileStoreWithProfiles } from '../../services/wsg-admin.service';

export type CoreProfile = Omit<MDProfile, 'groups'>;

@Component({
  selector: 'studio-lite-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent implements OnInit {
  isLoading: boolean = false;
  isError: boolean = false;
  PROFILE_REGISTRY = 'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv';
  storesURLs: string[] = [];
  ProfileStoreWithProfilesCollection : ProfileStoreWithProfiles[] = [];
  fetchedProfiles: CoreProfile[] = [];
  profilesSelected : CoreProfile[] = [];

  @Output() hasChanged = new EventEmitter<Array<CoreProfile>>();

  constructor(
    private wsgAdminService: WsgAdminService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.readCsv();
    this.fetchedProfiles = this.wsgAdminService.selectedWorkspaceGroupSettings.profiles || [];
    this.profilesSelected = this.fetchedProfiles;
  }

  async readCsv() {
    try {
      if (this.wsgAdminService.profileStores.length) {
        this.ProfileStoreWithProfilesCollection = this.wsgAdminService.profileStores;
      } else {
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
    const storesURLs = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const store of storesArray) {
      const sanitizedURL = store[2].replace(',', '');
      storesURLs.push(sanitizedURL);
    }
    this.storesURLs = storesURLs;
  }

  // eslint-disable-next-line class-methods-use-this
  async getProfile(profileURL:string) {
    try {
      const response = await fetch(`${profileURL}`);
      if (response.ok) {
        const data = await response.json();
        return new MDProfile(data);
      }
      return [];
    } catch {
      this.isError = true;
      this.isLoading = false;
      return [];
    }
  }

  isChecked(id:string):boolean {
    return !!this.fetchedProfiles?.find((profile: { id: string; }) => profile.id === id);
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

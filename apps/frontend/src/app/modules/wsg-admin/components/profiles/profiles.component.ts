import {
  Component, OnInit, Output, EventEmitter
} from '@angular/core';

import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { WsgAdminService } from '../../services/wsg-admin.service';
import { State } from '../../../admin/models/state.type';

type ProfileStore = {
  url: string,
  title: string,
  description: string,
  profiles: Array<Profile>
};
type Profile = {
  id: string,
  label: string
};

@Component({
  selector: 'studio-lite-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent implements OnInit {
  selectionChanged!: State[];
  editWorkspaceGroupSettingsForm: UntypedFormGroup;
  profileStores : Array<ProfileStore> = [];
  isLoading: boolean = false;
  isError: boolean = false;
  profiles: Array<Profile> = [];
  profilesSelected : Profile[] = [];
  data:any = { name: '', id: 1 };
  fetchedProfiles: Profile[] = [];
  stores:any = [];
  PROFILE_REGISTRY = 'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv';

  @Output() hasChanged = new EventEmitter<Array<Profile>>();

  constructor(
    private fb: UntypedFormBuilder,
    private wsgAdminService: WsgAdminService

  ) {
    this.editWorkspaceGroupSettingsForm = this.fb.group({
      name: this.fb.control(this.data.name, [Validators.required, Validators.minLength(3)])
    });
  }

  async ngOnInit(): Promise<void> {
    await this.readCsv();
    this.fetchedProfiles = this.wsgAdminService.selectedWorkspaceGroupSettings.profiles || [];
    this.profilesSelected = this.fetchedProfiles;
  }

  async readCsv() {
    try {
      if (this.wsgAdminService.profileStores) {
        this.profileStores = this.wsgAdminService.profileStores;
      } else {
        const response = await fetch(this.PROFILE_REGISTRY);
        if (response.ok) {
          this.isLoading = true;
          const data = await response.text();
          this.csvToObj(data, '"');
          // eslint-disable-next-line no-restricted-syntax
          for await (const store of this.stores) {
            const sanitizedUrl = store.url.replace(',', '');
            store.profiles = await this.getProfiles(sanitizedUrl);
            this.profileStores.push(store);
          }
          this.wsgAdminService.profileStores = this.profileStores;
          this.isLoading = false;
        }
      }
    } catch (err) {
      console.log('ERR', err);
      this.isLoading = false;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getProfile(profile:string) {
    try {
      const response = await fetch(`${profile}`);
      if (response.ok) {
        const data = await response.json();
        return {
          id: data.id,
          label: data.label[0].value
        };
      }
      return {
        message: 'Profil konnte nicht geladen werden',
        err: response.status
      };
    } catch (err) {
      return {
        message: 'Profil konnte nicht geladen werden',
        err: err
      };
    }
  }

  async getProfiles(profileStore:string) {
    try {
      const response = await fetch(`${profileStore}`);
      if (response.ok) {
        const store = await response.json();
        const profiles:any = [];
        // eslint-disable-next-line no-restricted-syntax
        for await (const profile of store.profiles) {
          const afterWith = (profileStore.slice(0, profileStore.lastIndexOf('/')));
          const pro = await this.getProfile(`${afterWith}/${profile}`);
          profiles.push(pro);
        }
        return profiles;
      }
      return {
        message: 'Profil konnte nicht geladen werden',
        err: response.status
      };
    } catch (err) {
      return {
        message: 'Profil konnte nicht geladen werden',
        err: err
      };
    }
  }

  csvToObj(stringVal:string, splitter:string) {
    const [keys, ...rest] = stringVal
      .trim()
      .split('\n')
      .map(item => item.split(splitter));
    const filteredRest = rest.map(e => e.filter(el => (el !== ',' && el !== '')));
    const splitKeys = keys[0].split(',');
    this.stores = filteredRest.map(item => {
      const object:any = {};
      // eslint-disable-next-line no-return-assign
      splitKeys.forEach((key, index) => (object[key] = item.at(index)));
      return object;
    });
  }

  isChecked(id:string):boolean {
    return !!this.fetchedProfiles?.find((profile: { id: string; }) => profile.id === id);
  }

  changeSelection(e:MatCheckboxChange) {
    e.checked ? this.profilesSelected.push({ id: e.source.name || '', label: e.source.id }) :
      this.profilesSelected = this.profilesSelected
        .filter((profile: Profile) => profile.id !== e.source.name);
    this.hasChanged.emit(this.profilesSelected);
  }
}

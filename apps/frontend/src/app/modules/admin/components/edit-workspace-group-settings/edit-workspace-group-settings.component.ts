import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { EditWorkspaceGroupComponentData } from '../../models/edit-workspace-group-component-data.type';
import { BackendService } from '../../services/backend.service';
import { State } from '../../models/state.type';

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
  selector: 'studio-lite-edit-workspace-group',
  templateUrl: './edit-workspace-group-settings.component.html',
  styleUrls: ['./edit-workspace-group-settings.component.scss']
})

export class EditWorkspaceGroupSettingsComponent implements OnInit {
  editWorkspaceGroupSettingsForm: UntypedFormGroup;
  profiles: Array<Profile> = [];
  profileStores : Array<ProfileStore> = [];
  PROFILE_REGISTRY = 'https://raw.githubusercontent.com/iqb-vocabs/profile-registry/master/registry.csv';
  formData: {
    profilesSelected : Profile[],
    states: State[]
  } = {
      profilesSelected: [],
      states: []
    };

  stores:any = [];
  fetchedProfiles: Profile[] = [];
  isLoading: boolean = false;

  constructor(
    public backendService: BackendService,
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: EditWorkspaceGroupComponentData) {
    this.editWorkspaceGroupSettingsForm = this.fb.group({
      name: this.fb.control(this.data.name, [Validators.required, Validators.minLength(3)])
    });
  }

  async readCsv() {
    try {
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
        this.isLoading = false;
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
    e.checked ? this.formData.profilesSelected.push({ id: e.source.name || '', label: e.source.id }) :
      this.formData.profilesSelected = this.formData.profilesSelected
        .filter((profile: Profile) => profile.id !== e.source.name);
  }

  async ngOnInit(): Promise<void> {
    await this.readCsv();
    this.backendService.getWorkspaceGroupProfiles(this.data.id).subscribe(res => {
      this.fetchedProfiles = res.settings?.profiles || [];
      this.formData.profilesSelected = this.fetchedProfiles;
    });
  }
}

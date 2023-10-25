import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MDProfile, MDProfileEntry, MDProfileGroup } from '@iqb/metadata';
import { ProfileEntryParametersText } from '@iqb/metadata/md-profile-entry';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as profile from './profile.json';
import { WorkspaceSettings } from '../../../wsg-admin/models/workspace-settings.interface';

@Component({
  selector: 'studio-lite-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent implements OnInit {
  @Output() metadataChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() metadataLoader!: BehaviorSubject<any>;
  @Input() language!: string;
  @Input() workspaceSettings!: WorkspaceSettings;

  private PROFILES_URL:string = 'https://w3id.org/iqb/profiles/';
  profileId!: string;

  labels: Record<string, string> = {};
  form = new FormGroup({});
  profile!: MDProfile;
  fields!: FormlyFieldConfig[];
  model: any = {};

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    console.log('profile', profile);
    this.getProfile(this.workspaceSettings.unitMDProfile as string);

    //const jsonString = JSON.stringify(profile);
    // if (jsonString !== 'undefined') {
    //   this.profile = new MDProfile(JSON.parse(jsonString));
    //   this.profileId = this.PROFILES_URL + this.profile.id;
    //
    //   this.metadataLoader.subscribe(metadata => {
    //     this.mapMetadataValuesToFormlyModel(metadata);
    //     this.mapProfileToFormlyFieldConfig();
    //   });
    // }
  }

  loadProfile(json: any) {
    this.profile = new MDProfile(json);
    this.profileId = this.PROFILES_URL + this.profile.id;

    this.metadataLoader.subscribe(metadata => {
      this.mapMetadataValuesToFormlyModel(metadata);
      this.mapProfileToFormlyFieldConfig();
    });
  }

  private getProfileok(url: string | undefined): void {
    if (url) {
      this.httpClient
        .get(url)
        .subscribe(response => console.log(response));
    }
  }

  async getProfile(profile:string) {
    try {
      const response = await fetch(`${profile}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        this.loadProfile(data);
        return data;
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


  private static mapType(entry: MDProfileEntry): string {
    let type: string = entry.type;
    if (entry.parameters instanceof ProfileEntryParametersText) {
      if (entry.parameters.format === 'multiline') {
        type = 'textarea';
      }
    }
    const typesMapping: Record<string, string> = {
      text: 'input',
      boolean: 'formlyToggle',
      number: 'number',
      vocabulary: 'chips',
      textarea: 'textarea'
    };
    return typesMapping[type];
  }

  mapFormlyModelToMetadataValues(): any {
    return {
      entries: [
        ...Object.entries(this.model).map((value:any) => {
          const valuesId = MetadataComponent.getMappedValue(value[1]);
          return ({
            id: value[0],
            label: [
              {
                lang: this.language,
                value: this.labels[value[0]]
              }
            ],
            value: valuesId
          });
        }
        )
      ],
      profileId: this.profileId
    };
  }

  private mapMetadataValuesToFormlyModel(metadata: any): any {
    if (metadata.entries) {
      metadata.entries.forEach((entry: any) => {
        this.model[entry.id] = entry.value;
      });
    }
  }

  private static getMappedValue(value: any): any {
    if (Array.isArray(value)) {
      return value.map((val: { id: string; }) => val.id.split('/')?.pop());
    }
    return value;
  }

  private mapProfileToFormlyFieldConfig(): void {
    const groups = this.profile?.groups;
    this.fields = groups?.map((group: MDProfileGroup) => ({
      wrappers: ['panel'],
      props: { label: group.label },
      fieldGroup:
        group.entries.map((entry: MDProfileEntry) => {
          this.registerLabel(entry);
          const props = {
            placeholder: '',
            label: entry.label,
            ...entry.parameters
          };
          return (
            {
              key: entry.id,
              type: MetadataComponent.mapType(entry),
              props: props
            });
        })
    })
    );
  }

  private registerLabel(entry: MDProfileEntry): void {
    this.labels[entry.id] = entry.label;
  }

  onModelChange() {
    const metadata = this.mapFormlyModelToMetadataValues();
    this.metadataChange.emit(metadata);
  }
}

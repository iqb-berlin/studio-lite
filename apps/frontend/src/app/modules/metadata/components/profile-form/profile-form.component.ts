import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  MDProfile, MDProfileEntry, MDProfileGroup, MDValue, ProfileEntryParametersNumber
} from '@iqb/metadata';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { ProfileEntryParametersText } from '@iqb/metadata/md-profile-entry';
import { MetadataService } from '../../services/metadata.service';

@Component({
  selector: 'studio-lite-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit, OnDestroy, OnChanges {
  constructor(public metadataService: MetadataService) {}

  @Output() metadataChange: EventEmitter<any> = new EventEmitter();
  @Input() language!: string;
  @Input() profileUrl!: string | undefined;
  @Input() metadataKey!: 'unitProfiles' | 'items' | 'itemProfiles';
  @Input() metadata!: any;
  @Input() formlyWrapper!: string;
  @Input() panelExpanded!: boolean;

  profileItemKeys: Record<string, any> = {};
  form = new FormGroup({});
  fields!: FormlyFieldConfig[];
  model: any = {};
  vocabulariesIdDictionary:any = {};

  ngUnsubscribe = new Subject<void>();

  ngOnInit() {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const profileUrl = 'profileUrl';
    if (!changes[profileUrl].firstChange && changes[profileUrl].previousValue !== changes[profileUrl].currentValue) {
      this.init();
    }
  }

  private init(): void {
    this.initProfile()
      .then((profile => this.loadProfile(profile)));
  }

  async initProfile() {
    return ProfileFormComponent.getProfile(this.profileUrl as string);
  }

  async loadProfile(json: any) {
    const profile = new MDProfile(json);
    this.metadataService.setProfile(profile, this.metadataKey);
    this.vocabulariesIdDictionary = await this.metadataService.getProfileVocabularies(profile);
    this.model = this.mapMetadataValuesToFormlyModel(
      this.findCurrentProfileMetadata(this.metadata[this.metadataKey])
    );
    this.fields = this.mapProfileToFormlyFieldConfig(profile);
  }

  private findCurrentProfileMetadata(metadata: any[]): any {
    if (!metadata || !metadata.length) return {};
    return metadata.find(data => data.profileId === this.metadataService.getProfile(this.metadataKey)?.id);
  }

  static async getProfile(profileUrl: string) {
    try {
      const response = await fetch(`${profileUrl}`);
      if (response.ok) {
        return await response.json();
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
    } else if (entry.parameters instanceof ProfileEntryParametersNumber) {
      if (entry.parameters.isPeriodSeconds) {
        type = 'duration';
      }
    }
    const typesMapping: Record<string, string> = {
      text: 'input',
      boolean: 'formlyToggle',
      number: 'number',
      duration: 'duration',
      vocabulary: 'chips',
      textarea: 'textarea'
    };
    return typesMapping[type];
  }

  mapFormlyModelToMetadataValues(model: any, profileId: string): any {
    return this.mapFormlyModelToMetadataValueEntries(Object.entries(model), profileId);
  }

  mapFormlyModelToMetadataValueEntries(allEntries: any[], profileId: string) : any {
    return {
      entries: [
        ...allEntries
          .map((keyValue: Record<string, any>) => ({
            id: keyValue[0],
            label: [{
              lang: this.language,
              value: this.profileItemKeys[keyValue[0]].label
            }],
            value: this.mapFormlyModelValueToMetadataValue(keyValue)
          }))
      ],
      profileId: profileId
    };
  }

  mapFormlyModelValueToMetadataValue(
    keyValue: Record<string, any>
  ) {
    if (this.profileItemKeys[keyValue[0]].type === 'text') {
      const textWithLanguages = Object.entries(keyValue[1]);
      return textWithLanguages
        .map(textWithLanguage => ({ lang: textWithLanguage[0], value: textWithLanguage[1] as string }));
    }
    if (this.profileItemKeys[keyValue[0]].type === 'vocabulary') {
      return keyValue[1].map((kv:any) => ({ id: kv?.id, text: kv?.text }));
    }
    return keyValue[1];
  }

  mapMetadataValuesToFormlyModel(metadata: any) {
    if (!metadata || !metadata.entries) return {};
    return this.mapMetaDataEntriesToFormlyModel(metadata.entries);
  }

  mapMetaDataEntriesToFormlyModel(entries: MDValue[]): any {
    const model: any = {};
    entries.forEach((entry: any) => {
      model[entry.id] = this.mapMetaDataEntriesValueToFormlyModelValue(entry.value);
    });
    return model;
  }

  mapMetaDataEntriesValueToFormlyModelValue(value: MDValue): any {
    if (Array.isArray(value)) {
      if (value.length && value[0].lang) {
        return value.reduce((obj, currentValue) => ({ ...obj, [currentValue.lang]: currentValue.value }), {});
      }
      if (value.length && value[0].id) {
        return value.map((v:any) => {
          const name = this.metadataService.vocabulariesIdDictionary[v.id].labels.de;
          const notation = this.metadataService.vocabulariesIdDictionary[v.id].notation[0] || '';
          return {
            name: `${notation} ${name} `,
            notation: notation,
            text: v.text,
            id: v.id
          };
        });
      }
      return [];
    }
    return value;
  }

  protected mapProfileToFormlyFieldConfig(profile: MDProfile): FormlyFieldConfig[] {
    const groups = profile?.groups;
    return groups?.map((group: MDProfileGroup) => ({
      wrappers: this.formlyWrapper ? [this.formlyWrapper] : undefined,
      props: {
        label: group.label,
        expanded: this.panelExpanded
      },
      fieldGroup:
        group.entries.map((entry: MDProfileEntry) => {
          this.registerProfileItem(entry);
          return ProfileFormComponent.getFormlyField(entry);
        })
    })
    );
  }

  static getFormlyField(entry: MDProfileEntry): FormlyFieldConfig {
    const props: any = {
      ...entry.parameters,
      label: entry.label
    };
    if (entry.parameters instanceof ProfileEntryParametersNumber) {
      if (ProfileFormComponent.mapType(entry) !== 'duration') {
        props.min = entry.parameters.minValue;
        props.max = entry.parameters.maxValue;
      }
    } else if (entry.parameters instanceof ProfileEntryParametersText) {
      if (ProfileFormComponent.mapType(entry) === 'textarea') {
        props.autosize = true;
        props.autosizeMinRows = 3;
        props.autosizeMaxRows = 10;
      }
      return {
        key: entry.id,
        fieldGroup: entry.parameters.textLanguages
          .map(language => ProfileFormComponent.createFormlyField(language, entry, props))
      };
    }
    return ProfileFormComponent.createFormlyField(entry.id, entry, props);
  }

  static createFormlyField(key: string, entry: MDProfileEntry, props: any): FormlyFieldConfig {
    return {
      key,
      type: ProfileFormComponent.mapType(entry),
      props
    };
  }

  private registerProfileItem(entry: MDProfileEntry): void {
    this.profileItemKeys[entry.id] = { label: entry.label, type: entry.type };
  }

  onModelChange(): void {
    const profile = this.metadataService.getProfile(this.metadataKey) as MDProfile;
    const metadata = this.mapFormlyModelToMetadataValues(this.model, profile.id);
    if (this.metadata && this.metadata[this.metadataKey]) {
      const index = this.metadata[this.metadataKey].findIndex((data: any) => data.profileId === profile.id);
      if (index < 0) {
        this.metadata[this.metadataKey].push(metadata);
      } else {
        this.metadata[this.metadataKey][index] = metadata;
      }
    } else {
      this.metadata[this.metadataKey] = [metadata];
    }
    this.metadataChange.emit(this.metadata);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

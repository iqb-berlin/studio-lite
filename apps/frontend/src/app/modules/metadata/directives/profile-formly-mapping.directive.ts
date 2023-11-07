import {
  Directive, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  MDProfile, MDProfileEntry, MDProfileGroup, MDValue, ProfileEntryParametersNumber
} from '@iqb/metadata';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ProfileEntryParametersText } from '@iqb/metadata/md-profile-entry';
import { MetadataService } from '../services/metadata.service';

@Directive({
  selector: '[profileFormlyMapping]'
})

export abstract class ProfileFormlyMappingDirective implements OnInit, OnDestroy {
  constructor(
    public metadataService: MetadataService
  ) {}

  @Output() metadataChange: EventEmitter<{ metadata: any, key: string, profileId: string }> = new EventEmitter();
  @Input() metadataLoader!: BehaviorSubject<any>;
  @Input() language!: string;
  @Input() profileUrl!: string | undefined;
  @Input() metadataKey!: 'unit' | 'items';

  profileItemKeys: Record<string, any> = {};
  form = new FormGroup({});
  profile!: MDProfile;
  fields!: FormlyFieldConfig[];
  model: any = {};
  vocabulariesIdDictionary:any = {};

  ngUnsubscribe = new Subject<void>();

  ngOnInit() {
    this.initProfile()
      .then((profile => this.loadProfile(profile)));
  }

  async initProfile() {
    return ProfileFormlyMappingDirective.getProfile(this.profileUrl as string);
  }

  async loadProfile(json: any) {
    this.profile = new MDProfile(json);
    this.vocabulariesIdDictionary = await this.metadataService.getProfileVocabularies(this.profile);
    this.metadataLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(metadata => {
        this.model = this.mapMetadataValuesToFormlyModel(metadata[this.metadataKey]);
        this.fields = this.mapProfileToFormlyFieldConfig(this.profile, 'panel');
      });
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
      return [{ id: keyValue[1][0]?.id, text: keyValue[1][0]?.text }];
    }
    return keyValue[1];
  }

  mapMetadataValuesToFormlyModel(metadata: any[]) {
    if (!metadata) return {};
    const currentMetadataIndex = metadata
      .findIndex((element: any) => element.profileId === this.profile.id);
    if (currentMetadataIndex < 0) return {};
    return this.mapMetaDataEntriesToFormlyModel(metadata[currentMetadataIndex].metadata.entries);
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
        const name = this.metadataService.vocabulariesIdDictionary[value[0].id];
        if (name?.labels.de) {
          return [{
            name: name.labels.de,
            text: value[0].text,
            id: value[0].id
          }];
        }
      }
      return [];
    }
    return value;
  }

  protected mapProfileToFormlyFieldConfig(profile: MDProfile, wrapper: string): FormlyFieldConfig[] {
    const groups = profile?.groups;
    return groups?.map((group: MDProfileGroup) => ({
      wrappers: wrapper ? [wrapper] : undefined,
      props: { label: group.label },
      fieldGroup:
          group.entries.map((entry: MDProfileEntry) => {
            this.registerProfileItem(entry);
            return ProfileFormlyMappingDirective.getFormlyField(entry);
          })
    })
    );
  }

  static getFormlyField(entry: MDProfileEntry): FormlyFieldConfig {
    const props = {
      placeholder: '',
      label: entry.label,
      autosize: true, // Textarea
      autosizeMinRows: 3, // Textarea
      autosizeMaxRows: 10, // Textarea
      min: 0, // NumberField
      ...entry.parameters
    };
    if (entry.parameters instanceof ProfileEntryParametersText) {
      return {
        key: entry.id,
        fieldGroup: entry.parameters.textLanguages
          .map(language => ProfileFormlyMappingDirective.createFormlyField(language, entry, props))
      };
    }
    return ProfileFormlyMappingDirective.createFormlyField(entry.id, entry, props);
  }

  static createFormlyField(key: string, entry: MDProfileEntry, props: any): FormlyFieldConfig {
    return {
      key,
      type: ProfileFormlyMappingDirective.mapType(entry),
      props
    };
  }

  private registerProfileItem(entry: MDProfileEntry): void {
    this.profileItemKeys[entry.id] = { label: entry.label, type: entry.type };
  }

  onModelChange(): void {
    const metadata = this.mapFormlyModelToMetadataValues(this.model, this.profile.id);
    this.metadataChange.emit({ metadata, key: this.metadataKey, profileId: this.profile.id });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

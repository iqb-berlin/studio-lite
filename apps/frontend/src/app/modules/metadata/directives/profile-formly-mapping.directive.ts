import {
  Directive, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  MDProfile,
  MDProfileEntry,
  MDProfileGroup,
  MDValue,
  TextsWithLanguageAndId,
  TextWithLanguage
} from '@iqb/metadata';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ProfileEntryParametersText } from '@iqb/metadata/md-profile-entry';

@Directive({
  selector: '[profileFormlyMapping]'
})
export abstract class ProfileFormlyMappingDirective implements OnInit, OnDestroy {
  @Output() metadataChange: EventEmitter<{ metadata: any, key: string }> = new EventEmitter();
  @Input() metadataLoader!: BehaviorSubject<any>;
  @Input() language!: string;
  @Input() profileUrl!: string | undefined;
  @Input() metadataKey!: 'unit' | 'items';

  profileItemKeys: Record<string, any> = {};
  form = new FormGroup({});
  profile!: MDProfile;
  fields!: FormlyFieldConfig[];
  model: any = {};

  ngUnsubscribe = new Subject<void>();

  ngOnInit() {
    this.initProfile()
      .then((profile => this.loadProfile(profile)));
  }

  private async initProfile() {
    return ProfileFormlyMappingDirective.getProfile(this.profileUrl as string);
  }

  loadProfile(json: any) {
    this.profile = new MDProfile(json);
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
  ): TextsWithLanguageAndId[] | TextWithLanguage[] | string | null {
    if (this.profileItemKeys[keyValue[0]].type === 'text') {
      const textWithLanguages = Object.entries(keyValue[1]);
      return textWithLanguages
        .map(textWithLanguage => ({ lang: textWithLanguage[0], value: textWithLanguage[1] as string }));
    }
    return keyValue[1];
  }

  // eslint-disable-next-line class-methods-use-this
  mapMetadataValuesToFormlyModel(metadata: { entries: MDValue[] }): any {
    if (!metadata || !metadata.entries) return {};
    return ProfileFormlyMappingDirective.mapMetaDataEntriesToFormlyModel(metadata.entries);
  }

  static mapMetaDataEntriesToFormlyModel(entries: MDValue[]): any {
    const model: any = {};
    entries.forEach((entry: any) => {
      model[entry.id] = ProfileFormlyMappingDirective.mapMetaDataEntriesValueToFormlyModelValue(entry.value);
    });
    return model;
  }

  static mapMetaDataEntriesValueToFormlyModelValue(value: MDValue): any {
    if (Array.isArray(value)) {
      if (value.length && value[0].lang) {
        return value.reduce((obj, currentValue) => ({ ...obj, [currentValue.lang]: currentValue.value }), {});
      }
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
    this.metadataChange.emit({ metadata, key: this.metadataKey });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

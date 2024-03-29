import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MDProfile, MDProfileEntry, MDProfileGroup, MDValue, ProfileEntryParametersNumber
} from '@iqb/metadata';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { ProfileEntryParametersText } from '@iqb/metadata/md-profile-entry';
import { MetadataService } from '../../services/metadata.service';
import { DurationService } from '../../services/duration.service';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'studio-lite-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, FormlyModule]
})
export class ProfileFormComponent implements OnInit, OnDestroy, OnChanges {
  constructor(public metadataService: MetadataService, public backendService:BackendService) {}

  @Output() metadataChange: EventEmitter<any> = new EventEmitter();
  @Input() language!: string;
  @Input() profileUrl!: string | undefined;
  @Input() metadataKey!: 'profiles' | 'items';
  @Input() metadata!: any;
  @Input() formlyWrapper!: string;
  @Input() panelExpanded!: boolean;

  form = new FormGroup({});
  fields!: FormlyFieldConfig[];
  model: any = {};
  profile!: MDProfile;

  private profileItemKeys: Record<string, any> = {};
  private ngUnsubscribe = new Subject<void>();

  ngOnInit() {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const metadata = 'metadata';
    if (changes[metadata] &&
      !changes[metadata].firstChange &&
      changes[metadata].previousValue !== changes[metadata].currentValue) {
      this.model = this.mapMetadataValuesToFormlyModel(
        this.findCurrentProfileMetadata(this.metadata[this.metadataKey])
      );
    }

    const profileUrl = 'profileUrl';
    if (changes[profileUrl] &&
      !changes[profileUrl].firstChange &&
      changes[profileUrl].previousValue !== changes[profileUrl].currentValue) {
      this.init();
    }
  }

  private init(): void {
    this.initProfile()
      .then((profile => this.loadProfile(profile)));
  }

  private async initProfile() {
    return this.getProfile(this.profileUrl as string);
  }

  private async loadProfile(json: unknown) {
    this.profile = new MDProfile(json);
    await this.metadataService.getProfileVocabularies(this.profile);
    this.model = this.mapMetadataValuesToFormlyModel(
      this.findCurrentProfileMetadata(this.metadata[this.metadataKey])
    );
    this.fields = this.mapProfileToFormlyFieldConfig(this.profile);
  }

  private findCurrentProfileMetadata(metadata: any[]): any {
    if (!metadata || !metadata.length) return {};
    return metadata.find(data => data.profileId === this.profile.id);
  }

  private async getProfile(profileUrl: string) {
    try {
      const response = await fetch(`${profileUrl}`);
      if (response.ok) {
        const profile = await response.json();
        this.backendService.saveProfile(profile).subscribe(() => {});
        return profile;
      }
      return await new Promise(resolve => {
        this.backendService.getProfile(profileUrl)
          .subscribe(profile => { resolve(profile); });
      });
    } catch (err) {
      return {};
    }
  }

  private static getFormlyType(entry: MDProfileEntry): string {
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

  // //////////////////////////////////
  // Formly Model To Metadata Values //
  // //////////////////////////////////
  private mapFormlyModelToMetadataValues(model: any, profileId: string): any {
    return this.mapFormlyModelToMetadataValueEntries(Object.entries(model), profileId);
  }

  private mapFormlyModelToMetadataValueEntries(allEntries: any[], profileId: string) : any {
    return {
      entries: [
        ...allEntries
          .map((keyValue: Record<string, any>) => ({
            id: keyValue[0],
            label: [{
              lang: this.language,
              value: this.profileItemKeys[keyValue[0]]?.label
            }],
            value: this.mapFormlyModelValueToMetadataValue(keyValue),
            valueAsText: this.mapFormlyModelValueToMetadataValueAsText(keyValue)
          }))
      ],
      profileId: profileId
    };
  }

  private mapFormlyModelValueToMetadataValue(keyValue: Record<string, any>) {
    const type = this.profileItemKeys[keyValue[0]]?.type;
    if (type === 'text') {
      const textWithLanguages = Object.entries(keyValue[1]);
      return textWithLanguages
        .map(textWithLanguage => ({ lang: textWithLanguage[0], value: textWithLanguage[1] as string }));
    }
    if (type === 'vocabulary') {
      return keyValue[1].map((kv:any) => ({ id: kv?.id, text: kv?.text }));
    }
    return keyValue[1].toString();
  }

  private mapFormlyModelValueToMetadataValueAsText(keyValue: Record<string, any>) {
    const type = this.profileItemKeys[keyValue[0]]?.type;
    if (type === 'text') {
      const textWithLanguages = Object.entries(keyValue[1]);
      return textWithLanguages
        .map(textWithLanguage => ({ lang: textWithLanguage[0], value: textWithLanguage[1] as string }));
    }
    if (type === 'vocabulary') {
      return keyValue[1].map((kv:any) => kv?.text).flat();
    }
    if (type === 'boolean') {
      return {
        lang: this.language,
        value: this.getBooleanTypeLabel(keyValue[0])
      };
    }
    if (type === 'number') {
      if (this.profileItemKeys[keyValue[0]].parameters.isPeriodSeconds) {
        const duration = DurationService.convertSecondsToMinutes(keyValue[1]);
        return {
          lang: this.language,
          value: `${duration.minutes}:${duration.seconds}`
        };
      }
    }
    return {
      lang: this.language,
      value: keyValue[1].toString()
    };
  }

  private getBooleanTypeLabel(id: string): string {
    if (id) {
      return this.profileItemKeys[id].parameters.trueLabel || id.toString();
    }
    return this.profileItemKeys[id].parameters.falseLabel || id.toString();
  }

  // //////////////////////////////////
  // Metadata Values To Formly Model //
  // //////////////////////////////////

  private mapMetadataValuesToFormlyModel(metadata: any) {
    if (!metadata || !metadata.entries) return {};
    return this.mapMetaDataEntriesToFormlyModel(metadata.entries);
  }

  private mapMetaDataEntriesToFormlyModel(entries: MDValue[]): any {
    const model: any = {};
    entries.forEach((entry: any) => {
      model[entry.id] = this.mapMetaDataEntriesValueToFormlyModelValue(entry.value);
    });
    return model;
  }

  private mapMetaDataEntriesValueToFormlyModelValue(value: any): any {
    if (Array.isArray(value)) {
      if (value.length && value[0].lang) {
        return value.reduce((obj, currentValue) => ({ ...obj, [currentValue.lang]: currentValue.value }), {});
      }
      if (value.length && value[0].id) {
        return value.map((v:any) => {
          const name = this.metadataService.vocabulariesIdDictionary[v.id]?.labels.de;
          const notation = this.metadataService.vocabulariesIdDictionary[v.id]?.notation[0] || '';
          return {
            name: `${this.metadataService.vocabulariesIdDictionary[v.id]?.hideNumbering ? '' : notation} ${name} `,
            notation: notation,
            text: v.text,
            id: v.id
          };
        });
      }
      return [];
    }
    // must be a boolean or number
    if (value === 'true') return true;
    if (value === 'false') return false;
    return parseInt(value, 10);
  }

  // ///////////////////////////
  // Profile to Formly Config //
  // ///////////////////////////

  private mapProfileToFormlyFieldConfig(profile: MDProfile): FormlyFieldConfig[] {
    if (profile) {
      const groups = profile?.groups;
      if (groups[0].label === 'Item') {
        this.metadataService.itemProfileColumns = groups[0];
      } else {
        this.metadataService.unitProfileColumns = groups;
      }

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
    } return [];
  }

  private static getFormlyField(entry: MDProfileEntry): FormlyFieldConfig {
    const props: any = {
      ...entry.parameters,
      label: entry.label
    };
    if (entry.parameters instanceof ProfileEntryParametersNumber) {
      if (ProfileFormComponent.getFormlyType(entry) !== 'duration') {
        props.min = entry.parameters.minValue;
        props.max = entry.parameters.maxValue;
      }
    } else if (entry.parameters instanceof ProfileEntryParametersText) {
      if (ProfileFormComponent.getFormlyType(entry) === 'textarea') {
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

  private static createFormlyField(key: string, entry: MDProfileEntry, props: any): FormlyFieldConfig {
    return {
      key,
      type: ProfileFormComponent.getFormlyType(entry),
      props
    };
  }

  private registerProfileItem(entry: MDProfileEntry): void {
    this.profileItemKeys[entry.id] = {
      label: entry.label,
      type: entry.type,
      parameters: entry.parameters
    };
  }

  onModelChange(): void {
    const metadata = this.mapFormlyModelToMetadataValues(this.model, this.profile.id);
    if (this.metadata && this.metadata[this.metadataKey]) {
      const index = this.metadata[this.metadataKey]
        .findIndex((data: any) => data.profileId === this.profile.id);
      if (index < 0) {
        this.metadata[this.metadataKey].push(metadata);
      } else {
        this.metadata[this.metadataKey][index] = metadata;
      }
    } else {
      this.metadata[this.metadataKey] = [metadata];
    }
    this.metadata[this.metadataKey] = this.defineCurrentProfile();
    this.metadataChange.emit(this.metadata);
  }

  private defineCurrentProfile(): any[] {
    // eslint-disable-next-line no-return-assign
    return this.metadata[this.metadataKey].map((metadata: any) => ({
      ...metadata,
      isCurrent: metadata.profileId === this.profile.id
    }));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

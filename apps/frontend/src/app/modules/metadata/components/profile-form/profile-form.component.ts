import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MDProfile,
  MDProfileEntry,
  MDProfileGroup,
  ProfileEntryParametersBoolean,
  ProfileEntryParametersNumber
} from '@iqb/metadata';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { ProfileEntryParametersText, ProfileEntryParametersVocabulary }
  from '@iqb/metadata/md-profile-entry';
import { TextWithLanguage } from '@iqb/metadata/md-main';
import { TextsWithLanguageAndId } from '@iqb/metadata/md-values';
import {
  MetadataProfileDto,
  MetadataValues,
  MetadataValuesEntry,
  UnitMetadataValues
} from '@studio-lite-lib/api-dto';
import { MetadataService } from '../../services/metadata.service';
import { DurationService } from '../../services/duration.service';
import { BackendService } from '../../services/backend.service';
import { VocabularyEntry } from '../../models/vocabulary.class';

interface FormlyConfigProps {
  label: string;
  min?: number;
  max?: number;
  autosize?: boolean;
  autosizeMinRows?: number;
  autosizeMaxRows?: number;
}

interface ProfileItemKeyValue {
  label: string;
  type: string;
  parameters: ProfileEntryParametersNumber | ProfileEntryParametersBoolean | ProfileEntryParametersText |
  ProfileEntryParametersVocabulary | null;
}

type ModelValueEntry = [string, ModelValue];

type ModelValue = string | number | boolean | Record<string, string> | VocabularyEntry[];

@Component({
  selector: 'studio-lite-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, FormlyModule]
})
export class ProfileFormComponent implements OnInit, OnDestroy, OnChanges {
  constructor(public metadataService: MetadataService, public backendService:BackendService) {}

  @Output() metadataChange: EventEmitter<Partial<UnitMetadataValues>> = new EventEmitter();
  @Input() language!: string;
  @Input() profileUrl!: string | undefined;
  @Input() metadata!: Partial<UnitMetadataValues>;
  @Input() formlyWrapper!: string;
  @Input() panelExpanded!: boolean;

  form = new FormGroup({});
  fields!: FormlyFieldConfig[];
  model: Record<string, ModelValue> = {};
  profile!: MDProfile;

  private profileItemKeys: Record<string, ProfileItemKeyValue> = {};
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
        this.findCurrentProfileMetadata(this.metadata.profiles)
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

  private async initProfile(): Promise<MetadataProfileDto | boolean> {
    return this.getProfile(this.profileUrl as string);
  }

  private async loadProfile(profile: MetadataProfileDto | boolean) {
    if (profile) {
      this.profile = new MDProfile(profile);
      const isLoaded = await this.metadataService.loadProfileVocabularies(this.profile);
      if (isLoaded) {
        this.fields = this.mapProfileToFormlyFieldConfig(this.profile);
        this.model = this.mapMetadataValuesToFormlyModel(
          this.findCurrentProfileMetadata(this.metadata.profiles)
        );
      } else {
        // eslint-disable-next-line no-console
        console.warn(`Profil ${this.profileUrl} could not be loaded`);
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Profil ${this.profileUrl} could not be loaded`);
    }
  }

  private findCurrentProfileMetadata(metadata: MetadataValues[] | undefined): MetadataValues | undefined {
    if (!metadata || !metadata.length) return {};
    return metadata.find(data => data.profileId === this.profile.id);
  }

  private async getProfile(profileUrl: string): Promise<MetadataProfileDto | boolean> {
    return new Promise(resolve => {
      this.backendService.getMetadataProfile(profileUrl)
        .subscribe(profile => {
          if (profile && profile !== true) {
            return resolve(profile);
          }
          return resolve(false);
        });
    });
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
  private mapFormlyModelToMetadataValues(model: Record<string, ModelValue>, profileId: string): MetadataValues {
    return this.mapFormlyModelToMetadataValueEntries(Object.entries(model), profileId);
  }

  private mapFormlyModelToMetadataValueEntries(allEntries: ModelValueEntry[], profileId: string) : MetadataValues {
    return {
      entries: [
        ...allEntries
          .map(entry => ({
            id: entry[0],
            label: [{
              lang: this.language,
              value: this.profileItemKeys[entry[0]]?.label
            }],
            value: this.mapFormlyModelValueToMetadataValue(entry),
            valueAsText: this.mapFormlyModelValueToMetadataValueAsText(entry)
          }))
      ],
      profileId: profileId
    };
  }

  private mapFormlyModelValueToMetadataValue(
    modelValueEntry: ModelValueEntry
  ): TextsWithLanguageAndId[] | TextWithLanguage[] | string {
    const type = this.profileItemKeys[modelValueEntry[0]]?.type;
    if (type === 'text') {
      const textWithLanguages = Object.entries(modelValueEntry[1]);
      return textWithLanguages
        .map(textWithLanguage => ({ lang: textWithLanguage[0], value: textWithLanguage[1] as string }));
    }
    if (type === 'vocabulary') {
      return (modelValueEntry[1] as VocabularyEntry[])
        .map(vocabEntry => ({ id: vocabEntry?.id, text: vocabEntry?.text }));
    }
    return modelValueEntry[1].toString();
  }

  private mapFormlyModelValueToMetadataValueAsText(
    modelValueEntry: ModelValueEntry
  ): TextWithLanguage | TextWithLanguage[] {
    const type = this.profileItemKeys[modelValueEntry[0]]?.type;
    if (type === 'text') {
      const textWithLanguages = Object.entries(modelValueEntry[1]);
      return textWithLanguages
        .map(textWithLanguage => ({ lang: textWithLanguage[0], value: textWithLanguage[1] as string }));
    }
    if (type === 'vocabulary') {
      return (modelValueEntry[1] as VocabularyEntry[])
        .map(vocabEntry => vocabEntry?.text).flat();
    }
    if (type === 'boolean') {
      return {
        lang: this.language,
        value: this.getBooleanTypeLabel(modelValueEntry[0])
      };
    }
    if (type === 'number') {
      if ((this.profileItemKeys[modelValueEntry[0]].parameters as ProfileEntryParametersNumber).isPeriodSeconds) {
        const duration = DurationService.convertSecondsToMinutes(Number(modelValueEntry[1]));
        return {
          lang: this.language,
          value: `${duration.minutes}:${duration.seconds}`
        };
      }
    }
    return {
      lang: this.language,
      value: modelValueEntry[1].toString()
    };
  }

  private getBooleanTypeLabel(value: string): string {
    if (value) {
      return (this.profileItemKeys[value].parameters as ProfileEntryParametersBoolean).trueLabel || value.toString();
    }
    return (this.profileItemKeys[value].parameters as ProfileEntryParametersBoolean).falseLabel || value.toString();
  }

  // //////////////////////////////////
  // Metadata Values To Formly Model //
  // //////////////////////////////////

  private mapMetadataValuesToFormlyModel(metadata: MetadataValues | undefined): Record<string, ModelValue> {
    if (!metadata || !metadata.entries) return {};
    return this.mapMetaDataEntriesToFormlyModel(metadata.entries);
  }

  private mapMetaDataEntriesToFormlyModel(entries: MetadataValuesEntry[]): Record<string, ModelValue> {
    const model: Record<string, ModelValue> = {};
    let triggerSaving = false;
    entries.forEach((entry: MetadataValuesEntry) => {
      const storedValue = this.mapMetaDataEntriesValueToFormlyModelValue(entry.value);
      if (this.isStoredValueValidForFormlyField(entry.id, storedValue)) {
        model[entry.id] = storedValue;
      } else {
        triggerSaving = true;
      }
    });
    if (triggerSaving) setTimeout(() => this.onModelChange());
    return model;
  }

  private isStoredValueValidForFormlyField(id: string, value: ModelValue): boolean {
    const type = this.profileItemKeys[id]?.type;
    if (value !== undefined) {
      if (!type) return false; // stored value does not match anymore
      if (type === 'text' && !(typeof value === 'object')) return false;
      if (type === 'vocabulary' && !Array.isArray(value)) return false;
      if (type === 'boolean' && !(typeof value === 'boolean')) return false;
      if (type === 'number' && !(typeof value === 'number')) return false;
    }
    return true;
  }

  private mapMetaDataEntriesValueToFormlyModelValue(
    value: TextsWithLanguageAndId[] | TextWithLanguage[] | string | null
  ): ModelValue {
    if (Array.isArray(value)) {
      if (value.length) {
        const valueElement = value[0];
        const hasLanguage = Object.prototype.hasOwnProperty.call(valueElement, 'lang');
        const hasId = Object.prototype.hasOwnProperty.call(valueElement, 'id');
        if (hasLanguage) {
          return (value as TextWithLanguage[]).reduce((obj, currentValue) => ({
            ...obj,
            [currentValue.lang]: currentValue.value
          }), {});
        }
        if (hasId) {
          return (value as TextsWithLanguageAndId[]).map(v => {
            const name = this.metadataService.vocabulariesIdDictionary[v.id]?.labels.de;
            const notation = this.metadataService.vocabulariesIdDictionary[v.id]?.notation[0] || '';
            return {
              name: `${this.metadataService.vocabulariesIdDictionary[v.id]?.hideNumbering ? '' : notation} ${name} `,
              notation: notation ? [notation] : [],
              text: v.text,
              id: v.id
            };
          });
        }
      }
      return [];
    }
    // must be a boolean or number
    if (value === 'true') return true;
    if (value === 'false') return false;
    return parseInt((value as string), 10);
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
        fieldGroup: group.entries
          .map((entry: MDProfileEntry) => {
            // this.checkStoredValueForField(entry);
            this.registerProfileItem(entry);
            return ProfileFormComponent.getFormlyField(entry);
          })
      }));
    } return [];
  }

  private static getFormlyField(entry: MDProfileEntry): FormlyFieldConfig {
    const props: FormlyConfigProps = {
      ...entry.parameters,
      label: entry.label
    };
    if (entry.parameters instanceof ProfileEntryParametersNumber) {
      if (ProfileFormComponent.getFormlyType(entry) !== 'duration') {
        props.min = entry.parameters.minValue === null ? undefined : entry.parameters.minValue;
        props.max = entry.parameters.maxValue === null ? undefined : entry.parameters.maxValue;
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

  private static createFormlyField(key: string, entry: MDProfileEntry, props: FormlyConfigProps): FormlyFieldConfig {
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
    if (this.metadata && this.metadata.profiles) {
      const index = this.metadata.profiles!
        .findIndex((data: MetadataValues) => data.profileId === this.profile.id);
      if (index < 0) {
        this.metadata.profiles!.push(metadata);
      } else {
        this.metadata.profiles![index] = metadata;
      }
    } else {
      this.metadata.profiles = [metadata];
    }
    this.metadata.profiles = this.defineCurrentProfile();
    this.metadataChange.emit(this.metadata);
  }

  private defineCurrentProfile(): MetadataValues[] {
    return this.metadata.profiles!.map((metadata: MetadataValues) => ({
      ...metadata,
      isCurrent: metadata.profileId === this.profile.id
    }));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

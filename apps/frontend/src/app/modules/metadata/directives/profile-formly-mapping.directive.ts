import {
  Directive, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { MDProfile, MDProfileEntry, MDProfileGroup } from '@iqb/metadata';
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

  labels: Record<string, string> = {};
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
        this.model = ProfileFormlyMappingDirective.mapMetadataValuesToFormlyModel(metadata[this.metadataKey] || {});
        this.fields = this.mapProfileToFormlyFieldConfig(this.profile);
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
    return {
      entries: [
        ...Object.entries(model)
          .map((value: any) => {
            const valuesId = value[1];
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
      profileId: profileId
    };
  }

  protected static mapMetadataValuesToFormlyModel(metadata: any): any {
    const model: any = {};
    if (metadata.entries) {
      metadata.entries.forEach((entry: any) => {
        model[entry.id] = entry.value;
      });
    }
    return model;
  }

  protected mapProfileToFormlyFieldConfig(profile: MDProfile): FormlyFieldConfig[] {
    const groups = profile?.groups;
    return groups?.map((group: MDProfileGroup) => ({
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
                type: ProfileFormlyMappingDirective.mapType(entry),
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
    const metadata = this.mapFormlyModelToMetadataValues(this.model, this.profile.id);
    this.metadataChange.emit({ metadata, key: this.metadataKey });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

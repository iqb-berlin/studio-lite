import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MDProfile, MDProfileEntry, MDProfileGroup } from '@iqb/metadata';
import { ProfileEntryParametersText } from '@iqb/metadata/md-profile-entry';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { WorkspaceSettings } from '../../../wsg-admin/models/workspace-settings.interface';

@Component({
  selector: 'studio-lite-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent implements OnInit, OnDestroy {
  @Output() metadataChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() metadataLoader!: BehaviorSubject<any>;
  @Input() itemsLoader!: BehaviorSubject<string[]>;
  @Input() language!: string;
  @Input() workspaceSettings!: WorkspaceSettings;

  items: string[] = [];

  labels: Record<string, string> = {};
  form = new FormGroup({});
  unitProfile!: MDProfile;
  fields!: FormlyFieldConfig[];
  model: any = {};

  private ngUnsubscribe = new Subject<void>();

  ngOnInit() {
    this.initProfile().then((profile => this.loadProfile(profile)));
    this.initItemProfile().then((profile => this.loadItemProfile(profile)));
  }

  private async initItemProfile() {
    return MetadataComponent.getProfile(this.workspaceSettings.itemMDProfile as string);
  }

  private async initProfile() {
    return MetadataComponent.getProfile(this.workspaceSettings.unitMDProfile as string);
  }

  loadProfile(json: any) {
    this.unitProfile = new MDProfile(json);
    this.metadataLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(metadata => {
        this.model = MetadataComponent.mapMetadataValuesToFormlyModel(metadata);
        this.fields = this.mapProfileToFormlyFieldConfig(this.unitProfile);
      });
  }

  loadItemProfile(json: any) {
    const itemProfile = new MDProfile(json);

    console.log(itemProfile);

    this.itemsLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(items => {
        this.items = items;
      });
  }

  static async getProfile(profileUrl:string) {
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
        ...Object.entries(model).map((value:any) => {
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

  private static mapMetadataValuesToFormlyModel(metadata: any): any {
    const model: any = {};
    if (metadata.entries) {
      metadata.entries.forEach((entry: any) => {
        model[entry.id] = entry.value;
      });
    }
    return model;
  }

  private mapProfileToFormlyFieldConfig(profile: MDProfile): FormlyFieldConfig[] {
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
    const metadata = this.mapFormlyModelToMetadataValues(this.model, this.unitProfile.id);
    this.metadataChange.emit(metadata);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

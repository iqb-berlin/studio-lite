import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MDProfile, MDProfileEntry, MDProfileGroup } from '@iqb/metadata';
import { ProfileEntryParametersText } from '@iqb/metadata/md-profile-entry';
import * as profile from './profile.json';

@Component({
  selector: 'studio-lite-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent implements OnInit {
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() model!: any;

  labels: Record<string, string> = {};
  form = new FormGroup({});
  mdProfile!: MDProfile;
  fields!: FormlyFieldConfig[];

  ngOnInit() {
    const jsonString = JSON.stringify(profile);
    if (jsonString !== 'undefined') {
      this.mdProfile = new MDProfile(JSON.parse(jsonString));
      this.fields = this.profileToFormlyMapper();
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

  private profileToFormlyMapper(): FormlyFieldConfig[] {
    const groups = this.mdProfile?.groups;

    return groups?.map((group: MDProfileGroup) => ({
      key: 'values',
      wrappers: ['panel'],
      props: { label: group.label },
      fieldGroup:
        group.entries.map((entry: MDProfileEntry) => {
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
}

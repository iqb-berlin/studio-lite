import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MDProfile, MDProfileEntry, MDProfileGroup } from '@iqb/metadata';
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

  private profileToFormlyMapper(): FormlyFieldConfig[] {
    const groups = this.mdProfile?.groups;

    const typesMapping: any = {
      text: 'input',
      boolean: 'formlyToggle',
      number: 'number',
      vocabulary: 'chips',
      textarea: 'textarea'
    };
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
          // TODO
          // if (entry.type === 'text' && entry.parameters?.multiLine) {
          //   entry.type = 'textarea';
          // }
          return (
            {
              key: entry.id,
              type: typesMapping[entry.type],
              props: props
            });
        })
    })
    );
  }
}

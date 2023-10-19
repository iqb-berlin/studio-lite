import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import * as profile from './profile.json';

@Component({
  selector: 'studio-lite-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent implements OnInit {
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() model!: any;
  form = new FormGroup({});
  profile!: any;
  groups!:any;
  fields!: FormlyFieldConfig[];

  ngOnInit() {
    const jsonString = JSON.stringify(profile);
    if (jsonString !== 'undefined') {
      this.profile = JSON.parse(jsonString);
    }
    this.fields = this.jsonToFormlyMapper();
  }

  private jsonToFormlyMapper() {
    const groups = this.profile?.groups;

    const typesMapping: any = {
      text: 'input',
      boolean: 'toggle',
      number: 'number',
      vocabulary: 'chips',
      textarea: 'textarea'
    };

    return groups?.map((group: { label: { value: any; }[]; entries: any[]; }) => ({
      key: 'text',
      wrappers: ['panel'],
      props: { label: group.label[0].value },
      fieldGroup:
          group.entries.map(entry => {
            const props = {
              placeholder: '',
              ...entry.parameters
            };
            if (entry.type === 'text' && entry.parameters?.multiLine) {
              entry.type = 'textarea';
            }
            return (
              {
                key: entry.id,
                type: typesMapping[entry.type],
                props: props,
                expressions: {
                  'props.label': `field.model.lang !== "de" ? "${entry.label[0]?.value}" : "${entry.label[1]?.value}"`
                }
              });
          })
    })
    );
  }
}

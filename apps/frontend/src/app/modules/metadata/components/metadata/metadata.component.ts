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

  labels: Record<string, string>[] = [];

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

  addLabel(entry: any, labelKey: string): Record<string, string> | null {
    const labelsLength = entry[labelKey].length;
    if (labelsLength) {
      if (labelKey === 'label') {
        this.labels[entry.id] = entry.label[0]?.value;
      }
      return {
        [`props.${labelKey}`]:
          `field.model.lang !== "de" ? "${entry[labelKey][0].value}" : "${entry[labelKey][labelsLength - 1]?.value}"`
      };
    }
    return null;
  }

  private jsonToFormlyMapper() {
    const groups = this.profile?.groups;

    const typesMapping: any = {
      text: 'input',
      boolean: 'formlyToggle',
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
                ...(entry.label && entry.label.length && this.addLabel(entry, 'label')),
                ...(entry.parameters && entry.parameters.trueLabel &&
                  entry.parameters.trueLabel.length && this.addLabel(entry.parameters, 'trueLabel')),
                ...(entry.parameters && entry.parameters.falseLabel &&
                  entry.parameters.falseLabel.length && this.addLabel(entry.parameters, 'falseLabel'))
              }
            });
        })
    })
    );
  }
}

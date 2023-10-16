import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'studio-lite-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent {
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();
  @Input() model!: any;
  form = new FormGroup({});
  fields: FormlyFieldConfig[] = [
    {
      key: 'text',
      type: 'input',
      props: {
        label: 'Textssss',
        placeholder: 'Type here to see the other field become enabled...'
      }
    },
    {
      key: 'vocabs',
      type: 'chips',
      props: {
        label: 'Textsssssssssssssssss',
        placeholder: 'TODO Problem in Component'
      }
    }
  ];
}

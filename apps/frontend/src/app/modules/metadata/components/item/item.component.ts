import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'studio-lite-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() variables!: string[];
  @Input() metadata!: any;
  @Input() profileUrl!: string | undefined;
  @Input() itemIndex!: number;
  @Input() language!: string;
  form = new FormGroup({});
  fields!: FormlyFieldConfig[];
  model: any = {};

  @Output() metadataChange: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.initModel();
    this.fields = [
      {
        fieldGroup: [
          {
            type: 'input',
            key: 'itemId',
            props: {
              placeholder: 'Item ID',
              label: 'Item ID',
              required: true
            }
          },
          {
            type: 'select',
            key: 'variableId',
            props: {
              placeholder: 'Variable auswählen',
              label: 'Variable auswählen',
              options: this.variables.map(variable => ({
                value: variable,
                label: variable
              }))
            }
          },
          {
            type: 'textarea',
            key: 'note',
            props: {
              placeholder: 'Notiz',
              label: 'Notiz',
              autosize: true,
              autosizeMinRows: 3,
              autosizeMaxRows: 10
            }
          }
        ]
      }
    ];
  }

  private initModel(): void {
    if (this.metadata[this.itemIndex].itemId) this.model.itemId = this.metadata[this.itemIndex].itemId;
    if (this.metadata[this.itemIndex].variableId) this.model.variableId = this.metadata[this.itemIndex].variableId;
    if (this.metadata[this.itemIndex].note) this.model.note = this.metadata[this.itemIndex].note;
  }

  onModelChange(): void {
    Object.entries(this.model).forEach((entry => {
      this.metadata[this.itemIndex][entry[0]] = entry[1];
    }));
    this.metadataChange.emit(this.metadata);
  }

  onMetadataChange(metadata: any): void {
    this.metadata[this.itemIndex] = metadata;
    this.metadataChange.emit(this.metadata);
  }
}

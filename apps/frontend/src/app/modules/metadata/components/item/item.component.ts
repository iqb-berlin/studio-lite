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
              required: true
            }
          },
          {
            type: 'select',
            key: 'variableId',
            props: {
              placeholder: 'Variable auswählen',
              options: this.variables.map(variable => ({
                value: variable,
                label: variable
              }))
            }
          }
        ]
      }
    ];
  }

  private initModel(): void {
    if (this.metadata[this.itemIndex].itemId) this.model.itemId = this.metadata[this.itemIndex].itemId;
    if (this.metadata[this.itemIndex].variableId) this.model.variableId = this.metadata[this.itemIndex].variableId;
  }

  onModelChange(): void {
    const loadedMetadata = JSON.parse(JSON.stringify(this.metadata));
    Object.entries(this.model).forEach((entry => {
      loadedMetadata[this.itemIndex][entry[0]] = entry[1];
    }));
    this.metadataChange.emit(loadedMetadata);
  }

  onMetadataChange(metadata: any): void {
    const loadedMetadata = JSON.parse(JSON.stringify(this.metadata));
    Object.entries(this.model).forEach((entry => {
      loadedMetadata[this.itemIndex][entry[0]] = entry[1];
    }));
    loadedMetadata[this.itemIndex] = metadata;
    this.metadataChange.emit(loadedMetadata);
  }
}

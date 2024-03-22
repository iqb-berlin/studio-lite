import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { ProfileFormComponent } from '../profile-form/profile-form.component';

@Component({
  selector: 'studio-lite-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  standalone: true,
  imports: [MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, FormsModule, ReactiveFormsModule, FormlyModule, ProfileFormComponent, TranslateModule]
})
export class ItemComponent implements OnInit, OnChanges {
  constructor(private translateService:TranslateService) { }
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
    this.initField();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const variables: string = 'variables';
    if (changes[variables] &&
      !changes[variables].firstChange) {
      this.initField();
    }
  }

  private initField(): void {
    this.fields = [
      {
        fieldGroup: [
          {
            type: 'input',
            key: 'id',
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
              placeholder: this.translateService.instant('metadata.choose-item-variable'),
              label: this.translateService.instant('metadata.choose-item-variable'),
              options: [{ value: '', label: '' }, ...this.variables.map(variable => ({
                value: variable,
                label: variable
              }))]
            }
          },
          {
            type: 'input',
            key: 'weighting',
            props: {
              type: 'number',
              min: 0,
              placeholder: this.translateService.instant('metadata.item-weighting'),
              label: this.translateService.instant('metadata.item-weighting')
            }
          },
          {
            type: 'textarea',
            key: 'description',
            props: {
              placeholder: this.translateService.instant('metadata.item-description'),
              label: this.translateService.instant('metadata.item-description'),
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
    if (this.metadata[this.itemIndex].id) this.model.id = this.metadata[this.itemIndex].id;
    if (this.metadata[this.itemIndex].variableId) this.model.variableId = this.metadata[this.itemIndex].variableId;
    if (this.metadata[this.itemIndex].description) this.model.description = this.metadata[this.itemIndex].description;
    if (this.metadata[this.itemIndex].weighting) this.model.weighting = this.metadata[this.itemIndex].weighting;
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

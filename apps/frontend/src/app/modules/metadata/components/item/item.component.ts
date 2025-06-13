import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { ItemsMetadataValues, ProfileMetadataValues } from '@studio-lite-lib/api-dto';
import { MDProfile } from '@iqb/metadata';
import { MatIcon } from '@angular/material/icon';
import { ProfileFormComponent } from '../profile-form/profile-form.component';
import { AliasId } from '../../models/alias-id.interface';
import { ItemModel } from '../../models/item-model.interface';

@Component({
  selector: 'studio-lite-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, FormsModule, ReactiveFormsModule, FormlyModule, ProfileFormComponent, TranslateModule, MatIcon]
})
export class ItemComponent implements OnInit, OnChanges {
  constructor(private translateService:TranslateService) { }
  @Input() variables!: AliasId[];
  @Input() metadata!: ItemsMetadataValues[];
  @Input() profile!: MDProfile;
  @Input() itemIndex!: number;
  @Input() language!: string;
  form = new FormGroup({});
  fields!: FormlyFieldConfig[];
  model: ItemModel = {};

  @Output() metadataChange: EventEmitter<ItemsMetadataValues[]> = new EventEmitter();

  ngOnInit(): void {
    this.initModel();
    this.initField();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const variables: string = 'variables';
    if (changes[variables] &&
      !changes[variables].firstChange) {
      this.updateModelVariableId();
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
              label: this.translateService.instant('metadata.choose-item-variable')
            },
            expressions: {
              'props.options': () => [
                { value: null, label: '' },
                ...this.getNotUsedVariables().map(variable => ({
                  value: variable.alias,
                  label: variable.alias
                }))
              ],
              'model.variableReadOnlyId': (field: FormlyFieldConfig) => this.variables
                .find(variable => variable.alias === field.model.variableId)?.id || null
            }
          },
          {
            type: 'input',
            key: 'weighting',
            props: {
              type: 'number',
              min: 0,
              placeholder: this.translateService.instant('metadata.weighting'),
              label: this.translateService.instant('metadata.weighting')
            }
          },
          {
            type: 'textarea',
            key: 'description',
            props: {
              placeholder: this.translateService.instant('metadata.description'),
              label: this.translateService.instant('metadata.description'),
              autosize: true,
              autosizeMinRows: 3,
              autosizeMaxRows: 10
            }
          }
        ]
      }
    ];
  }

  getNotUsedVariables(): AliasId[] {
    // Filter out variables that are already used in the metadata but not in the current item
    return this.variables.filter(variable => !this.metadata
      .some(item => item.variableReadOnlyId === variable.id && item.variableId !== this.model.variableId)
    );
  }

  private initModel(): void {
    if (this.metadata[this.itemIndex].id) this.model.id = this.metadata[this.itemIndex].id;
    if (this.metadata[this.itemIndex].description) this.model.description = this.metadata[this.itemIndex].description;
    if (this.metadata[this.itemIndex].weighting) this.model.weighting = this.metadata[this.itemIndex].weighting;
    this.updateModelVariableId();
  }

  private updateModelVariableId(): void {
    if (this.metadata[this.itemIndex].variableReadOnlyId) {
      this.model.variableReadOnlyId = this.metadata[this.itemIndex].variableReadOnlyId;
      this.model.variableId = this.variables
        .find(variable => variable.id === this.model.variableReadOnlyId)?.alias;
    } else if (this.metadata[this.itemIndex].variableId) { // old Metadata
      this.model.variableReadOnlyId = this.metadata[this.itemIndex].variableId;
      this.metadata[this.itemIndex].variableReadOnlyId = this.model.variableReadOnlyId;
      this.model.variableId = this.variables
        .find(variable => variable.id === this.model.variableReadOnlyId)?.alias;
    }
    // update the variableId of the stored metadata
    if (!!this.model.variableId && this.metadata[this.itemIndex].variableId !== this.model.variableId) {
      this.metadata[this.itemIndex].variableId = this.model.variableId;
      this.emitMetadata();
    } else if (!this.model.variableId && this.metadata[this.itemIndex].variableId) {
      // variable was removed
      this.metadata[this.itemIndex].variableId = null;
      this.metadata[this.itemIndex].variableReadOnlyId = null;
      this.emitMetadata();
    }
  }

  onModelChange(): void {
    Object.entries(this.model).forEach((entry => {
      this.metadata[this.itemIndex][entry[0]] = entry[1];
    }));
    this.emitMetadata();
  }

  onMetadataChange(metadata: Partial<ProfileMetadataValues>): void {
    this.metadata[this.itemIndex] = metadata;
    this.emitMetadata();
  }

  private emitMetadata(): void {
    this.metadataChange.emit(this.metadata);
  }
}

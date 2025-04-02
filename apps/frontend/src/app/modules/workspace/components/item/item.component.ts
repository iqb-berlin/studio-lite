import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { ItemsMetadataValues, ProfileMetadataValues } from '@studio-lite-lib/api-dto';
import { MDProfile, MDProfileGroup } from '@iqb/metadata';
import { ProfileFormComponent } from '@iqb/ngx-metadata-components';
import { Vocab } from '@iqb/ngx-metadata-components/lib/models/vocabulary.class';
import { WorkspaceService } from '../../services/workspace.service';

export interface AliasId {
  id: string;
  alias: string;
}

interface ItemModel {
  id?: string;
  variableId?: string;
  variableReadOnlyId?: string;
  description?: string;
  weighting?: number;
  [key: string]: string | number | undefined;
}

@Component({
  selector: 'studio-lite-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  // eslint-disable-next-line max-len
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    ProfileFormComponent,
    TranslateModule,
    ProfileFormComponent
  ]
})
export class ItemComponent implements OnInit, OnChanges {
  constructor(
    private translateService: TranslateService,
    public workspaceService: WorkspaceService
  ) {}

  @Input() variables!: AliasId[];
  @Input() metadata!: ItemsMetadataValues[];
  @Input() itemIndex!: number;
  @Input() language!: string;
  @Input() profile!: MDProfile;
  @Input() unitProfileColumns: MDProfileGroup[] = [];
  @Input() itemProfileColumns: MDProfileGroup = {} as MDProfileGroup;

  vocabularies !: Vocab[];
  form = new FormGroup({});
  fields!: FormlyFieldConfig[];
  model: ItemModel = {};

  @Output() metadataChange: EventEmitter<ItemsMetadataValues[]> =
    new EventEmitter();

  ngOnInit(): void {
    this.workspaceService.vocabularies$.subscribe(vocab => {
      this.vocabularies = vocab;
    });
    setTimeout(() => {
      this.initModel();
      this.initField();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const variables: string = 'variables';
    if (changes[variables] && !changes[variables].firstChange) {
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
              placeholder: this.translateService.instant(
                'metadata.choose-item-variable'
              ),
              label: this.translateService.instant(
                'metadata.choose-item-variable'
              ),
              options: [
                { value: '', label: '' },
                ...this.variables.map(variable => ({
                  value: variable.alias,
                  label: variable.alias
                }))
              ]
            },
            expressions: {
              'model.variableReadOnlyId': (field: FormlyFieldConfig) => this.variables.find(
                variable => variable.alias === field.model.variableId
              )?.id
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
              placeholder: this.translateService.instant(
                'metadata.description'
              ),
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

  private initModel(): void {
    const currentMetadata = this.metadata[this.itemIndex];
    this.model.id = currentMetadata.id || this.model.id;
    this.model.description =
      currentMetadata.description || this.model.description;
    this.model.weighting = currentMetadata.weighting || this.model.weighting;
    this.updateModelVariableId();
  }

  private updateModelVariableId(): void {
    if (this.metadata[this.itemIndex].variableReadOnlyId) {
      this.model.variableReadOnlyId =
        this.metadata[this.itemIndex].variableReadOnlyId;
      this.model.variableId = this.variables.find(
        variable => variable.id === this.model.variableReadOnlyId
      )?.alias;
    } else if (this.metadata[this.itemIndex].variableId) {
      // old Metadata
      this.model.variableReadOnlyId = this.metadata[this.itemIndex].variableId;
      this.model.variableId = this.variables.find(
        variable => variable.id === this.model.variableReadOnlyId
      )?.alias;
    }
  }

  onModelChange(): void {
    Object.entries(this.model).forEach(entry => {
      if (entry[1] !== undefined) {
        this.metadata[this.itemIndex][entry[0]] = entry[1];
      }
    });
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

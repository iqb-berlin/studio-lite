import {
  Component, Input, OnInit
} from '@angular/core';
import { MDProfile } from '@iqb/metadata';
import { takeUntil } from 'rxjs';
import { ProfileFormlyMappingDirective } from '../../directives/profile-formly-mapping.directive';

@Component({
  selector: 'studio-lite-item-profile',
  templateUrl: './item-profile.component.html',
  styleUrls: ['./item-profile.component.scss']
})
export class ItemProfileComponent extends ProfileFormlyMappingDirective implements OnInit {
  @Input() items!: string[];
  override async loadProfile(json: any) {
    this.profile = new MDProfile(json);
    await this.metadataService.getProfileVocabularies(this.profile);
    this.metadataLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(metadata => {
        const profileItemId = 'profileItemId';
        const codingItemId = 'codingItemId';
        this.profileItemKeys[profileItemId] = { label: 'Item ID', type: 'custom' };
        this.profileItemKeys[codingItemId] = { label: 'Variable auswählen', type: 'custom' };
        this.currentMatadataStorageIndex = !metadata[this.metadataKey] ? 0 : metadata[this.metadataKey].length - 1;
        this.model = !metadata[this.metadataKey] ? {} : this
          .mapMetadataValuesToFormlyModel(metadata[this.metadataKey][this.currentMatadataStorageIndex]);
        const itemFields = this.mapProfileToFormlyFieldConfig(this.profile, '');
        this.fields = [
          {
            key: this.metadataKey,
            type: 'repeat',
            props: {
              addText: 'Item-Variable hinzufügen',
              label: 'Item Variablen bearbeiten'
            },
            fieldArray: {
              wrappers: ['panel'],
              props: {
                label: '<ohne ID>'
              },
              fieldGroup: [
                {
                  type: 'input',
                  key: 'profileItemId',
                  props: {
                    placeholder: 'Item ID',
                    required: true
                  }
                },
                {
                  type: 'select',
                  key: 'codingItemId',
                  props: {
                    placeholder: 'Variable auswählen',
                    options: this.items.map(item => ({ value: item, label: item }))
                  }
                },
                ...itemFields
              ]
            }
          }
        ];
      });
  }

  // eslint-disable-next-line class-methods-use-this
  override mapMetadataValuesToFormlyModel(metadata: any): any {
    if (!Array.isArray(metadata)) return {};
    return {
      [this.metadataKey]: metadata
        .map((item: any) => this.mapMetaDataEntriesToFormlyModel(item.entries))
    };
  }

  override mapFormlyModelToMetadataValues(model: any, profileId: string): any[] {
    return model[this.metadataKey]
      .map(((item: any[]) => this.mapFormlyModelToMetadataValueEntries(Object.entries(item), profileId)));
  }
}

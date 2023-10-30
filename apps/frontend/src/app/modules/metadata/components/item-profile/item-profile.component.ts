import { Component, Input, OnInit } from '@angular/core';
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

  override loadProfile(json: any) {
    this.profile = new MDProfile(json);
    this.metadataLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(metadata => {
        this.model = ProfileFormlyMappingDirective.mapMetadataValuesToFormlyModel(metadata[this.metadataKey] || {});
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
              fieldGroup: [
                {
                  type: 'input',
                  key: 'profileItemId',
                  props: {
                    placeholder: 'Item Id',
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
}

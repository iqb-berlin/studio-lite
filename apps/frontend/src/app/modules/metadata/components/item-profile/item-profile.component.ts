import {
  Component, Input, OnInit
} from '@angular/core';
import { MDProfile } from '@iqb/metadata';
import { BehaviorSubject, take, takeUntil } from 'rxjs';
import { ProfileFormlyMappingDirective } from '../../directives/profile-formly-mapping.directive';

@Component({
  selector: 'studio-lite-item-profile',
  templateUrl: './item-profile.component.html',
  styleUrls: ['./item-profile.component.scss']
})
export class ItemProfileComponent extends ProfileFormlyMappingDirective implements OnInit {
  items: string[] = [];
  @Input() itemsLoader!: BehaviorSubject<string[]>;

  override ngOnInit() {
    this.itemsLoader
      .pipe(
        takeUntil(this.ngUnsubscribe),
        take(1))
      .subscribe(items => {
        this.initProfile()
          .then((profile => this.loadProfile(profile)));
        this.items = items;
        this.subscribeForItemChanges();
      });
  }

  subscribeForItemChanges(): void {
    this.itemsLoader
      .pipe(
        takeUntil(this.ngUnsubscribe))
      .subscribe(items => {
        this.initProfile()
          .then((profile => this.loadProfile(profile)));
        this.items = items;
      });
  }

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
        this.model = this
          .mapMetadataValuesToFormlyModel(metadata[this.metadataKey]);
        this.creatFormlyFields();
      });
  }

  private creatFormlyFields(): void {
    const itemFields = this.mapProfileToFormlyFieldConfig(this.profile, '');
    this.fields = [
      {
        key: this.metadataKey,
        type: 'repeat',
        props: {
          addText: 'Item hinzufügen'
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
  }

  override mapMetadataValuesToFormlyModel(metadata: any): any {
    if (!metadata) return {};
    const currentMetadataIndex = metadata.findIndex((element: any) => element.profileId === this.profile.id);
    if (currentMetadataIndex < 0) return {};
    return {
      [this.metadataKey]: metadata[currentMetadataIndex].metadata
        .map((item: any) => this.mapMetaDataEntriesToFormlyModel(item.entries))
    };
  }

  override mapFormlyModelToMetadataValues(model: any, profileId: string): any[] {
    return model[this.metadataKey]
      .map(((item: any[]) => this.mapFormlyModelToMetadataValueEntries(Object.entries(item), profileId)));
  }
}

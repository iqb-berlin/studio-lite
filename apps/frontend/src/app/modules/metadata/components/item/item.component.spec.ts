import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { Component, Input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ItemsMetadataValues } from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of } from 'rxjs';
import { ProfileFormComponent } from '@iqb/metadata-components';
import { ItemComponent } from './item.component';
import { MetadataService } from '../../services/metadata.service';
import { MetadataBackendService } from '../../services/metadata-backend.service';
import { IdValidator } from '../../metadata.module';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;

  @Component({ selector: 'iqb-profile-form', template: '', standalone: true })
  class MockProfileFormComponent {
    @Input() language!: string;
    @Input() profileData!: unknown;
    @Input() metadataValues!: unknown;
    @Input() formlyWrapper!: string;
    @Input() panelExpanded!: boolean;
    @Input() vocabularyProvider!: unknown;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        FormlyModule.forRoot({
          validators: [{ name: 'id', validation: IdValidator }]
        }),
        FormlyMaterialModule,
        TranslateModule.forRoot(),
        ItemComponent,
        MockProfileFormComponent
      ],
      providers: [
        TranslateService,
        { provide: 'SERVER_URL', useValue: 'http://localhost/' },
        { provide: MetadataService, useValue: { vocabularies: [], vocabulariesIdDictionary: {} } },
        { provide: MetadataBackendService, useValue: { getMetadataVocabulariesForProfile: () => of([]) } }
      ]
    })
      .overrideComponent(ItemComponent, {
        remove: { imports: [ProfileFormComponent] },
        add: { imports: [MockProfileFormComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;

    component.metadata = [{ id: 'item1', variableId: 'var1' } as unknown as ItemsMetadataValues];
    component.itemIndex = 0;
    component.variables = [{ id: 'v1', alias: 'var1' }];
    component.lastUpdatedItemIndex = new BehaviorSubject<number>(-1);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize model and fields on ngOnInit', () => {
    expect(component.model.id).toBe('item1');
    expect(component.fields.length).toBeGreaterThan(0);
  });

  it('should update model when lastUpdatedItemIndex changes for a different index', () => {
    const initFieldSpy = jest.spyOn(component as unknown as { initField: () => void }, 'initField');
    component.lastUpdatedItemIndex.next(1);
    expect(initFieldSpy).toHaveBeenCalled();
  });

  it('should emit metadataChange when onModelChange is called', () => {
    const emitSpy = jest.spyOn(component.metadataChange, 'emit');
    component.model.description = 'new description';
    component.onModelChange();
    expect(component.metadata[0].description).toBe('new description');
    expect(emitSpy).toHaveBeenCalledWith(component.metadata);
  });

  it('should update profiles and keep the item identity when onMetadataChange is called', () => {
    const emitSpy = jest.spyOn(component.metadataChange, 'emit');
    const originalItem = component.metadata[0];
    const profiles = [{ profileId: 'p1', entries: [] }];
    const newMetadata = { profiles } as unknown as Parameters<typeof component.onMetadataChange>[0];
    component.onMetadataChange(newMetadata);
    expect(component.metadata[0]).toBe(originalItem);
    expect(component.metadata[0].profiles).toEqual(profiles);
    expect(emitSpy).toHaveBeenCalledWith(component.metadata);
  });

  it('should not overwrite core item fields with stale values from onMetadataChange', () => {
    component.metadata[0].description = 'current description';
    component.metadata[0].weighting = 2;
    const newMetadata = {
      id: 'stale-id',
      description: 'stale description',
      weighting: 1,
      profiles: [{ profileId: 'p1', entries: [] }]
    } as unknown as Parameters<typeof component.onMetadataChange>[0];
    component.onMetadataChange(newMetadata);
    expect(component.metadata[0].id).toBe('item1');
    expect(component.metadata[0].description).toBe('current description');
    expect(component.metadata[0].weighting).toBe(2);
  });

  it('should get unused variables correctly', () => {
    component.variables = [
      { id: 'v1', alias: 'var1' },
      { id: 'v2', alias: 'var2' }
    ];
    component.metadata = [
      { id: 'item1', variableReadOnlyId: 'v1', variableId: 'var1' } as unknown as ItemsMetadataValues,
      { id: 'item2', variableReadOnlyId: 'v2', variableId: 'var2' } as unknown as ItemsMetadataValues
    ];
    component.itemIndex = 0;
    component.model.variableId = 'var1';

    const unused = component.getNotUsedVariables();
    expect(unused.map(v => v.id)).toContain('v1');
    expect(unused.map(v => v.id)).not.toContain('v2');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { Component, Input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ItemsMetadataValues } from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of } from 'rxjs';
import { ItemComponent } from './item.component';
import { ProfileFormComponent } from '../profile-form/profile-form.component';
import { MetadataService } from '../../services/metadata.service';
import { MetadataBackendService } from '../../services/metadata-backend.service';
import { IdValidator } from '../../metadata.module';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;

  @Component({ selector: 'studio-lite-profile-form', template: '', standalone: true })
  class MockProfileFormComponent {
    @Input() language!: string;
    @Input() profileUrl!: string | undefined;
    @Input() metadataKey!: 'profiles' | 'items';
    @Input() metadata!: ItemsMetadataValues[];
    @Input() formlyWrapper!: string;
    @Input() panelExpanded!: boolean;
    @Input() profile!: unknown;
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

  it('should update metadata when onMetadataChange is called', () => {
    const emitSpy = jest.spyOn(component.metadataChange, 'emit');
    const newMetadata = { id: 'item1', description: 'updated' } as unknown as ItemsMetadataValues;
    component.onMetadataChange(newMetadata);
    expect(component.metadata[0]).toEqual(newMetadata);
    expect(emitSpy).toHaveBeenCalled();
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

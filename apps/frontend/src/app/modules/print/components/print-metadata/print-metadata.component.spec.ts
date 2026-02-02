import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ItemsMetadataValues, MetadataValues, UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { PrintMetadataComponent } from './print-metadata.component';

describe('PrintMetadataComponent', () => {
  let component: PrintMetadataComponent;
  let fixture: ComponentFixture<PrintMetadataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PrintMetadataComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintMetadataComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should update unitProfiles and items when metadata changes', () => {
      const mockProfiles: MetadataValues[] = [
        {
          profileId: 'profile1'
        }
      ];
      const mockItems: ItemsMetadataValues[] = [
        {
          id: 'item1',
          profiles: []
        }
      ];
      const mockMetadata: UnitMetadataValues = {
        profiles: mockProfiles,
        items: mockItems
      };

      component.metadata = mockMetadata;
      component.ngOnChanges({
        metadata: new SimpleChange(null, mockMetadata, true)
      });

      expect(component.unitProfiles).toEqual(mockProfiles);
      expect(component.items).toEqual(mockItems);
    });

    it('should update unitProfiles when only profiles exist', () => {
      const mockProfiles: MetadataValues[] = [
        {
          profileId: 'profile1'
        }
      ];
      const mockMetadata: UnitMetadataValues = {
        profiles: mockProfiles
      };

      component.metadata = mockMetadata;
      component.ngOnChanges({
        metadata: new SimpleChange(null, mockMetadata, true)
      });

      expect(component.unitProfiles).toEqual(mockProfiles);
      expect(component.items).toBeUndefined();
    });

    it('should update items when only items exist', () => {
      const mockItems: ItemsMetadataValues[] = [
        {
          id: 'item1',
          profiles: []
        }
      ];
      const mockMetadata: UnitMetadataValues = {
        items: mockItems
      };

      component.metadata = mockMetadata;
      component.ngOnChanges({
        metadata: new SimpleChange(null, mockMetadata, true)
      });

      expect(component.items).toEqual(mockItems);
      expect(component.unitProfiles).toBeUndefined();
    });

    it('should not update properties if metadata is null', () => {
      const previousProfiles: MetadataValues[] = [
        {
          profileId: 'old'
        }
      ];
      component.unitProfiles = previousProfiles;

      component.ngOnChanges({
        metadata: new SimpleChange(null, null, false)
      });

      expect(component.unitProfiles).toEqual(previousProfiles);
    });

    it('should not update if changes do not include metadata', () => {
      const previousProfiles: MetadataValues[] = [
        {
          profileId: 'old'
        }
      ];
      component.unitProfiles = previousProfiles;

      component.ngOnChanges({
        otherProperty: new SimpleChange(null, 'value', false)
      });

      expect(component.unitProfiles).toEqual(previousProfiles);
    });

    it('should handle empty profiles and items arrays', () => {
      const mockMetadata: UnitMetadataValues = {
        profiles: [],
        items: []
      };

      component.metadata = mockMetadata;
      component.ngOnChanges({
        metadata: new SimpleChange(null, mockMetadata, true)
      });

      expect(component.unitProfiles).toEqual([]);
      expect(component.items).toEqual([]);
    });

    it('should update when metadata changes from null to populated', () => {
      component.metadata = null;
      fixture.detectChanges();

      const mockMetadata: UnitMetadataValues = {
        profiles: [
          {
            profileId: 'p1'
          }
        ],
        items: [
          {
            id: 'i1',
            profiles: []
          }
        ]
      };

      component.metadata = mockMetadata;
      component.ngOnChanges({
        metadata: new SimpleChange(null, mockMetadata, false)
      });

      expect(component.unitProfiles).toBeDefined();
      expect(component.items).toBeDefined();
    });

    it('should handle metadata with undefined profiles and items', () => {
      const mockMetadata: UnitMetadataValues = {};

      component.metadata = mockMetadata;
      component.ngOnChanges({
        metadata: new SimpleChange(null, mockMetadata, true)
      });

      expect(component.unitProfiles).toBeUndefined();
      expect(component.items).toBeUndefined();
    });
  });
});

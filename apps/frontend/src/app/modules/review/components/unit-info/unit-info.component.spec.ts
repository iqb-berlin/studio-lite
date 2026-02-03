import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { environment } from '../../../../../environments/environment';
import { UnitInfoComponent } from './unit-info.component';
import { ReviewService } from '../../services/review.service';

describe('UnitInfoComponent', () => {
  let component: UnitInfoComponent;
  let fixture: ComponentFixture<UnitInfoComponent>;
  let mockReviewService: jest.Mocked<ReviewService>;

  const mockUnitProperties: UnitPropertiesDto = {
    id: 1,
    key: 'unit-key-1',
    name: 'Test Unit',
    description: 'Test Description',
    reference: 'ref-123',
    transcript: 'Test Transcript',
    groupName: 'Test Group',
    player: 'player-1',
    editor: 'editor-1',
    schemer: 'schemer-1',
    lastChangedDefinition: new Date('2024-01-01'),
    lastChangedMetadata: new Date('2024-01-02'),
    lastChangedScheme: new Date('2024-01-03'),
    lastChangedDefinitionUser: 'user1',
    lastChangedMetadataUser: 'user2',
    lastChangedSchemeUser: 'user3'
  };

  beforeEach(async () => {
    mockReviewService = {
      unitInfoPanelOn: false,
      unitInfoPanelWidth: 300,
      reviewId: 1,
      reviewConfig: {
        showMetadata: false,
        showCoding: false,
        showOthersComments: false
      }
    } as unknown as jest.Mocked<ReviewService>;

    await TestBed.configureTestingModule({
      imports: [
        UnitInfoComponent,
        TranslateModule.forRoot(),
        MatIconModule,
        MatTooltipModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ReviewService, useValue: mockReviewService },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    describe('unitId setter', () => {
      it('should set id property when unitId input is provided', () => {
        component.unitId = 42;
        expect(component.id).toBe(42);
      });

      it('should handle zero as unitId', () => {
        component.unitId = 0;
        expect(component.id).toBe(0);
      });

      it('should handle negative unitId', () => {
        component.unitId = -1;
        expect(component.id).toBe(-1);
      });
    });

    describe('unitProperties setter', () => {
      it('should set properties when valid unitProperties are provided', () => {
        component.unitProperties = mockUnitProperties;
        expect(component.properties).toEqual(mockUnitProperties);
      });

      it('should handle undefined unitProperties', () => {
        component.unitProperties = undefined;
        expect(component.properties).toBeUndefined();
      });

      it('should replace existing properties with new ones', () => {
        const firstProperties: UnitPropertiesDto = { ...mockUnitProperties, key: 'first' };
        const secondProperties: UnitPropertiesDto = { ...mockUnitProperties, key: 'second' };

        component.unitProperties = firstProperties;
        expect(component.properties?.key).toBe('first');

        component.unitProperties = secondProperties;
        expect(component.properties?.key).toBe('second');
      });
    });
  });

  describe('elementWidth getter/setter', () => {
    it('should set element width correctly', fakeAsync(() => {
      component.elementWidth = 400;
      tick();

      expect(component.elementWidth).toBe(400);
    }));

    it('should set unitInfoPanelOn to true when width is greater than 0', fakeAsync(() => {
      component.elementWidth = 350;
      tick();

      expect(mockReviewService.unitInfoPanelOn).toBe(true);
    }));

    it('should set unitInfoPanelOn to false when width is 0', fakeAsync(() => {
      component.elementWidth = 0;
      tick();

      expect(mockReviewService.unitInfoPanelOn).toBe(false);
    }));

    it('should update unitInfoPanelWidth in service when width is greater than 0', fakeAsync(() => {
      component.elementWidth = 500;
      tick();

      expect(mockReviewService.unitInfoPanelWidth).toBe(500);
    }));

    it('should not update unitInfoPanelWidth in service when width is 0', fakeAsync(() => {
      mockReviewService.unitInfoPanelWidth = 300;
      component.elementWidth = 0;
      tick();

      expect(mockReviewService.unitInfoPanelWidth).toBe(300);
    }));

    it('should apply correct CSS width including offset', fakeAsync(() => {
      component.elementWidth = 400;
      tick();
      fixture.detectChanges();

      const element = fixture.nativeElement;
      expect(element.style.width).toBe('440px'); // 400 + 40 offset
    }));

    it('should apply minimal CSS width when width is 0', fakeAsync(() => {
      component.elementWidth = 0;
      tick();
      fixture.detectChanges();

      const element = fixture.nativeElement;
      expect(element.style.width).toBe('40px'); // just the offset
    }));
  });

  describe('ngAfterViewInit()', () => {
    it('should initialize element width from reviewService', fakeAsync(() => {
      mockReviewService.unitInfoPanelWidth = 450;

      component.ngAfterViewInit();
      tick();

      expect(component.elementWidth).toBe(450);
    }));

    it('should set up mousedown event handler on splitter', fakeAsync(() => {
      component.ngAfterViewInit();
      tick();

      expect(component.splitterElement).toBeDefined();
    }));
  });

  describe('Mouse Event Handling', () => {
    let mockSplitterElement: HTMLElement;
    let mockMouseDownEvent: MouseEvent;

    beforeEach(fakeAsync(() => {
      mockSplitterElement = document.createElement('div');
      component.splitterElement = {
        nativeElement: mockSplitterElement
      } as typeof component.splitterElement;

      component.elementWidth = 300;
      tick();

      component.ngAfterViewInit();
      tick();
    }));

    it('should handle mousedown event on splitter', fakeAsync(() => {
      mockMouseDownEvent = new MouseEvent('mousedown', { clientX: 100, buttons: 1 });

      mockSplitterElement.dispatchEvent(mockMouseDownEvent);
      tick();

      const mouseXOffset = (component as unknown as { mouseXOffset: number }).mouseXOffset;
      expect(mouseXOffset).toBe(400); // 100 + 300
    }));

    it('should reset mouseXOffset after mouseup', fakeAsync(() => {
      mockMouseDownEvent = new MouseEvent('mousedown', { clientX: 100, buttons: 1 });
      mockSplitterElement.dispatchEvent(mockMouseDownEvent);
      tick();

      const mouseXOffsetBefore = (component as unknown as { mouseXOffset: number }).mouseXOffset;
      expect(mouseXOffsetBefore).not.toBe(0);

      const mockMouseUpEvent = new MouseEvent('mouseup');
      fixture.nativeElement.dispatchEvent(mockMouseUpEvent);
      tick();

      const mouseXOffsetAfter = (component as unknown as { mouseXOffset: number }).mouseXOffset;
      expect(mouseXOffsetAfter).toBe(0);
    }));
  });

  describe('ngOnDestroy()', () => {
    it('should clean up event handlers', fakeAsync(() => {
      const mockSplitterElement = document.createElement('div');
      component.splitterElement = {
        nativeElement: mockSplitterElement
      } as typeof component.splitterElement;

      component.ngAfterViewInit();
      tick();

      mockSplitterElement.onmousedown = jest.fn();
      fixture.nativeElement.onmousemove = jest.fn();
      fixture.nativeElement.onmouseup = jest.fn();

      component.ngOnDestroy();

      expect(mockSplitterElement.onmousedown).toBeNull();
      expect(fixture.nativeElement.onmousemove).toBeNull();
      expect(fixture.nativeElement.onmouseup).toBeNull();
    }));

    it('should handle destroy when splitterElement is undefined', () => {
      component.splitterElement = undefined!;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Component Dependencies', () => {
    it('should inject ReviewService', () => {
      expect(component.reviewService).toBeDefined();
    });

    it('should have reviewService accessible', () => {
      expect(component.reviewService).toBe(mockReviewService);
    });
  });

  describe('Protected Properties', () => {
    it('should expose "of" operator from rxjs', () => {
      const ofOperator = (component as unknown as { of: unknown }).of;
      expect(ofOperator).toBeDefined();
    });
  });
});

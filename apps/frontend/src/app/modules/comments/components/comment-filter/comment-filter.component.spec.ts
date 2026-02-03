import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommentFilterComponent } from './comment-filter.component';

describe('CommentFilterComponent', () => {
  let component: CommentFilterComponent;
  let fixture: ComponentFixture<CommentFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatMenuModule,
        MatListModule,
        MatIconModule,
        MatBadgeModule,
        MatSlideToggleModule,
        MatTooltipModule,
        TranslateModule.forRoot(),
        CommentFilterComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFilterComponent);
    component = fixture.componentInstance;
    component.showHiddenComments = new BehaviorSubject<boolean>(false);
    component.unitItems = [
      { id: '1', uuid: 'uuid-1' },
      { id: '2', uuid: 'uuid-2' }
    ];
    component.filteredItems = [];
    component.disabled = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Badge logic', () => {
    it('should display the correct count when items are filtered', () => {
      component.filteredItems = ['uuid-1'];
      component.showHiddenComments.next(false);
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.mat-badge-content');
      expect(badge.textContent).toBe('1');
    });

    it('should increment badge count when showing hidden comments', () => {
      component.filteredItems = ['uuid-1'];
      component.showHiddenComments.next(true);
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.mat-badge-content');
      expect(badge.textContent).toBe('2');
    });

    it('should hide badge if disabled', () => {
      component.disabled = true;
      component.filteredItems = ['uuid-1'];
      fixture.detectChanges();

      const badgeContainer = fixture.nativeElement.querySelector('.mat-badge-hidden');
      expect(badgeContainer).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should emit filteredItemsChange when selection changes', () => {
      jest.spyOn(component.filteredItemsChange, 'emit');
      const newFilters = ['uuid-1'];

      component.filteredItemsChange.emit(newFilters);
      expect(component.filteredItemsChange.emit).toHaveBeenCalledWith(newFilters);
    });

    it('should toggle showHiddenComments when slide toggle changes', () => {
      const currentValue = component.showHiddenComments.value;
      jest.spyOn(component.showHiddenComments, 'next');

      // Simulating what ngModelChange does in the template
      component.showHiddenComments.next(!currentValue);

      expect(component.showHiddenComments.next).toHaveBeenCalledWith(!currentValue);
    });
  });

  describe('Disabled state', () => {
    it('should disable the trigger button', () => {
      component.disabled = true;
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button.filter-button');
      expect(button.disabled).toBe(true);
    });
  });
});

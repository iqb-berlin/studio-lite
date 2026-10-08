// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { BookletConfigDto, ReviewConfigDto } from '@studio-lite-lib/api-dto';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewConfigComponent } from './review-config.component';
import { ReviewConfigEditComponent } from '../review-config-edit/review-config-edit.component';
import { BookletConfigEditComponent } from '../booklet-config-edit/booklet-config-edit.component';

@Component({ selector: 'studio-lite-review-config-edit', template: '', standalone: true })
class MockReviewConfigEditComponent {
  @Input() config!: ReviewConfigDto;
  @Input() disabled: boolean = false;
  @Output() configChanged = new EventEmitter<ReviewConfigDto>();
}

@Component({ selector: 'studio-lite-booklet-config-edit', template: '', standalone: true })
class MockBookletConfigEditComponent {
  @Input() config!: BookletConfigDto;
  @Input() disabled: boolean = false;
  @Output() configChanged = new EventEmitter<BookletConfigDto>();
}

describe('ReviewConfigComponent', () => {
  let component: ReviewConfigComponent;
  let fixture: ComponentFixture<ReviewConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReviewConfigComponent,
        TranslateModule.forRoot(),
        FormsModule
      ]
    })
      .overrideComponent(ReviewConfigComponent, {
        remove: { imports: [ReviewConfigEditComponent, BookletConfigEditComponent] },
        add: { imports: [MockReviewConfigEditComponent, MockBookletConfigEditComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReviewConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('of a selected review', () => {
    const inputs = (): HTMLInputElement[] => Array.from(fixture.nativeElement.querySelectorAll('input'));
    const editComponents = () => [
      fixture.debugElement.query(By.directive(MockReviewConfigEditComponent)).componentInstance,
      fixture.debugElement.query(By.directive(MockBookletConfigEditComponent)).componentInstance
    ] as { disabled: boolean }[];

    const render = async (disabled: boolean): Promise<void> => {
      fixture.componentRef.setInput('selectedReviewId', 1);
      fixture.componentRef.setInput('disabled', disabled);
      fixture.detectChanges();
      // ngModel applies `disabled` asynchronously
      await fixture.whenStable();
      fixture.detectChanges();
    };

    it('should enable name, password and settings', async () => {
      await render(false);

      expect(inputs()).toHaveLength(2);
      expect(inputs().every(input => !input.disabled)).toBe(true);
      expect(editComponents().every(edit => !edit.disabled)).toBe(true);
    });

    it('should disable name, password and settings while disabled', async () => {
      await render(true);

      expect(inputs()).toHaveLength(2);
      expect(inputs().every(input => input.disabled)).toBe(true);
      expect(editComponents().every(edit => edit.disabled)).toBe(true);
    });
  });

  it('should handle name change', () => {
    const emitSpy = jest.spyOn(component.nameChange, 'emit');
    component.name = 'new name';
    component.nameChange.emit('new name');
    expect(emitSpy).toHaveBeenCalledWith('new name');
  });
});

// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { BookletConfigDto, ReviewConfigDto } from '@studio-lite-lib/api-dto';
import { FormsModule } from '@angular/forms';
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

  it('should handle name change', () => {
    const emitSpy = jest.spyOn(component.nameChange, 'emit');
    component.name = 'new name';
    component.nameChange.emit('new name');
    expect(emitSpy).toHaveBeenCalledWith('new name');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { CommentItemComponent } from './comment-item.component';

describe('CommentItemComponent', () => {
  let component: CommentItemComponent;
  let fixture: ComponentFixture<CommentItemComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
        CommentItemComponent
      ]
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.setTranslation('en', {
      comment: {
        item: 'Comment for {{itemAlias}}'
      }
    });
    translateService.use('en');

    fixture = TestBed.createComponent(CommentItemComponent);
    component = fixture.componentInstance;
    component.label = 'Test Item';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label', () => {
    const debugElement = fixture.debugElement.nativeElement.querySelector('.comment-item');
    expect(debugElement.textContent.trim()).toBe('Test Item');
  });

  it('should have translated tooltip', () => {
    component.label = 'Alias B';
    fixture.detectChanges();

    const tooltipDirective = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip);
    // ngx-translate 'translate' pipe returns the key if not found,
    // but here we want to see if it's called with the right context.
    // The pulse of the pipe is hard to test directly without mocking the pipe,
    // but the Directive message property should contain the result.
    expect(tooltipDirective.message).toBe('Comment for Alias B');
  });
});

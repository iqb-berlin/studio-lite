import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { CommentBadgeComponent } from './comment-badge.component';

describe('CommentBadgeComponent', () => {
  let component: CommentBadgeComponent;
  let fixture: ComponentFixture<CommentBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatTooltipModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentBadgeComponent);
    component = fixture.componentInstance;
    component.userName = 'user';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display acronym for "Lastname, Firstname"', () => {
    component.userName = 'Doe, John';
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.userAcronym).toBe('JD');
    const debugElement = fixture.debugElement.nativeElement.querySelector('.comment-acronym');
    expect(debugElement.textContent.trim()).toBe('JD');
  });

  it('should display acronym for single name', () => {
    component.userName = 'John';
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.userAcronym).toBe('JO');
    const debugElement = fixture.debugElement.nativeElement.querySelector('.comment-acronym');
    expect(debugElement.textContent.trim()).toBe('JO');
  });

  it('should apply "own-comment" class when ownComment is true', () => {
    component.ownComment = true;
    fixture.detectChanges();
    const debugElement = fixture.debugElement.nativeElement.querySelector('.comment-acronym');
    expect(debugElement.classList.contains('own-comment')).toBe(true);
  });

  it('should not apply "own-comment" class when ownComment is false', () => {
    component.ownComment = false;
    fixture.detectChanges();
    const debugElement = fixture.debugElement.nativeElement.querySelector('.comment-acronym');
    expect(debugElement.classList.contains('own-comment')).toBe(false);
  });

  it('should have userName as tooltip', () => {
    component.userName = 'Doe, John';
    fixture.detectChanges();
    const tooltipDirective = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip);
    expect(tooltipDirective.message).toBe('Doe, John');
  });
});

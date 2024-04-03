import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
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
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentItemSelectionComponent } from './comment-item-selection.component';

describe('CommentItemSelectionComponent', () => {
  let component: CommentItemSelectionComponent;
  let fixture: ComponentFixture<CommentItemSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    })
      .compileComponents();

    fixture = TestBed.createComponent(CommentItemSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

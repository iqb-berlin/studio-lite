import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CommentItemFilterComponent } from './comment-item-filter.component';

describe('CommentItemFilterComponent', () => {
  let component: CommentItemFilterComponent;
  let fixture: ComponentFixture<CommentItemFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({}),
        CommentItemFilterComponent
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CommentItemFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

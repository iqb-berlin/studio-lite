import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { CommentFilterComponent } from './comment-filter.component';

describe('CommentFilterComponent', () => {
  let component: CommentFilterComponent;
  let fixture: ComponentFixture<CommentFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({}),
        CommentFilterComponent
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CommentFilterComponent);
    component = fixture.componentInstance;
    component.showHiddenComments = new BehaviorSubject(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

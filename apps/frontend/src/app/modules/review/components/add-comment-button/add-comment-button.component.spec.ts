import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { createMock } from '@golevelup/ts-jest';
import { AddCommentButtonComponent } from './add-comment-button.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { ReviewService } from '../../services/review.service';

describe('AddCommentButtonComponent', () => {
  let component: AddCommentButtonComponent;
  let fixture: ComponentFixture<AddCommentButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddCommentButtonComponent, WrappedIconComponent],
      providers: [{
        provide: ReviewService,
        useValue: createMock<ReviewService>()
      }],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatTooltipModule,
        MatDialogModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddCommentButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

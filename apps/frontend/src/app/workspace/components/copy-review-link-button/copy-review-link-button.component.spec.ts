import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CopyReviewLinkButtonComponent } from './copy-review-link-button.component';

describe('CopyReviewLinkButtonComponent', () => {
  let component: CopyReviewLinkButtonComponent;
  let fixture: ComponentFixture<CopyReviewLinkButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CopyReviewLinkButtonComponent],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        MatSnackBarModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CopyReviewLinkButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

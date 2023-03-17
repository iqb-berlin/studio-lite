import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { StartReviewButtonComponent } from './start-review-button.component';

describe('StartReviewButtonComponent', () => {
  let component: StartReviewButtonComponent;
  let fixture: ComponentFixture<StartReviewButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StartReviewButtonComponent],
      imports: [
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StartReviewButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

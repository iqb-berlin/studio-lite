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

  it('should set locationOrigin from window', () => {
    expect(component.locationOrigin).toBe(window.location.origin);
  });

  it('should accept inputs', () => {
    component.selectedReviewId = 5;
    component.unitCount = 12;

    expect(component.selectedReviewId).toBe(5);
    expect(component.unitCount).toBe(12);
  });
});

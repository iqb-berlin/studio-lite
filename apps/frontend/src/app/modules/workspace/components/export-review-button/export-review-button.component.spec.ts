import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { provideHttpClient } from '@angular/common/http';
import { ExportReviewButtonComponent } from './export-review-button.component';
import { environment } from '../../../../../environments/environment';

describe('ExportReviewButtonComponent', () => {
  let component: ExportReviewButtonComponent;
  let fixture: ComponentFixture<ExportReviewButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatDialogModule,
        MatIconModule
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]

    }).compileComponents();

    fixture = TestBed.createComponent(ExportReviewButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ExportReviewButtonComponent } from './export-review-button.component';
import { environment } from '../../../../../environments/environment';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

describe('ExportReviewButtonComponent', () => {
  let component: ExportReviewButtonComponent;
  let fixture: ComponentFixture<ExportReviewButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ExportReviewButtonComponent,
        WrappedIconComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
        HttpClientModule,
        MatDialogModule,
        MatIconModule
      ],
      providers: [{
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

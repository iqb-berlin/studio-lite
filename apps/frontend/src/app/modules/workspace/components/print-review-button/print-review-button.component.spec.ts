import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { PrintReviewButtonComponent } from './print-review-button.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { environment } from '../../../../../environments/environment';

describe('PrintReviewButtonComponent', () => {
  let component: PrintReviewButtonComponent;
  let fixture: ComponentFixture<PrintReviewButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PrintReviewButtonComponent,
        WrappedIconComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintReviewButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../../../../../environments/environment';
import { CodingReportComponent } from './coding-report.component';

describe('CodingReportComponent', () => {
  let component: CodingReportComponent;
  let fixture: ComponentFixture<CodingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CodingReportComponent
      ],
      imports: [
        MatDialogModule,
        HttpClientModule,
        MatExpansionModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CodingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';
import { LoginAlternativeWarningComponent } from './login-alternative-warning.component';

describe('LoginAlternativeWarningComponent', () => {
  let component: LoginAlternativeWarningComponent;
  let fixture: ComponentFixture<LoginAlternativeWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginAlternativeWarningComponent],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }, {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot(),
        MatDialogModule,
        MatIconModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginAlternativeWarningComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

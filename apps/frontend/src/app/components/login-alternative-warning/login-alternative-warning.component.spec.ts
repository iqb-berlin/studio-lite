import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginAlternativeWarningComponent } from './login-alternative-warning.component';

describe('LoginAlternativeWarningComponent', () => {
  let component: LoginAlternativeWarningComponent;
  let fixture: ComponentFixture<LoginAlternativeWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }, {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ],
      imports: [
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

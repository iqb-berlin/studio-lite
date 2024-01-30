// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../environments/environment';
import { LoginComponent } from './login.component';
import { AuthService } from '../../modules/auth/service/auth.service';
import { WrappedIconComponent } from '../../modules/shared/components/wrapped-icon/wrapped-icon.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  @Component({ selector: 'studio-lite-warning', template: '' })
  class MockWarningComponent {
    @Input() warnMessage!: string;
  }

  @Component({ selector: 'studio-lite-area-title', template: '' })
  class MockAreaTitleComponent {
    @Input() title!: string;
  }

  class MockAuthService {
    loggedIn: boolean = false;

    isLoggedIn() {
      return this.loggedIn;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LoginComponent,
        MockWarningComponent,
        MockAreaTitleComponent,
        WrappedIconComponent
      ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      },
      {
        provide: MAT_DIALOG_DATA,
        useValue: {}
      },
      {
        provide: AuthService,
        useClass: MockAuthService
      }]
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

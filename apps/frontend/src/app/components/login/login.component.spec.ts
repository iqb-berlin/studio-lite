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
import { environment } from '../../../environments/environment';
import { LoginComponent } from './login.component';
import { AuthService } from '../../modules/auth/service/auth.service';

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
        MockAreaTitleComponent
      ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }, {
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

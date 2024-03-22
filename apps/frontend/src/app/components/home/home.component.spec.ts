// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock } from '@golevelup/ts-jest';
import { environment } from '../../../environments/environment';
import { HomeComponent } from './home.component';
import { AuthService } from '../../../../../api/src/app/auth/service/auth.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  @Component({ selector: 'studio-lite-app-info', template: '' })
  class MockAppInfoComponent {
    @Input() appTitle!: string;
    @Input() introHtml!: SafeUrl | undefined;
    @Input() appName!: string;
    @Input() appVersion!: string;
    @Input() userName!: string;
    @Input() userLongName!: string;
    @Input() isUserLoggedIn!: boolean;
    @Input() isAdmin!: boolean;
    @Input() hasReviews!: boolean;
  }

  @Component({ selector: 'studio-lite-login', template: '' })
  class MockLoginComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockAppInfoComponent,
        MockLoginComponent
      ],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: 'APP_VERSION',
          useValue: '0.0.0'
        },
        {
          provide: 'APP_NAME',
          useValue: 'Studio-Lite'
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

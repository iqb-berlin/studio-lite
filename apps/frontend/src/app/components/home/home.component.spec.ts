// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HomeComponent } from './home.component';
import { LoginComponent } from '../login/login.component';
import { UserWorkspacesAreaComponent } from '../user-workspaces-area/user-workspaces-area.component';
import { UserReviewsAreaComponent } from '../user-reviews-area/user-reviews-area.component';
import { AppInfoComponent } from '../app-info/app-info.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  @Component({ selector: 'studio-lite-app-info', standalone: true, template: '' })
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

  @Component({ selector: 'studio-lite-login', standalone: true, template: '' })
  class MockLoginComponent {}

  @Component({ selector: 'studio-lite-user-workspaces-area', standalone: true, template: '' })
  class MockUserWorkspacesAreaComponent {}

  @Component({ selector: 'studio-lite-user-reviews-area', standalone: true, template: '' })
  class MockUserReviewsAreaComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).overrideComponent(HomeComponent, {
      remove: {
        imports: [
          LoginComponent,
          UserWorkspacesAreaComponent,
          AppInfoComponent,
          UserReviewsAreaComponent
        ]
      },
      add: {
        imports: [
          MockLoginComponent,
          MockUserWorkspacesAreaComponent,
          MockAppInfoComponent,
          MockUserReviewsAreaComponent
        ]
      }
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

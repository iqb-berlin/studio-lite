import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { AppInfoContentComponent } from './app-info-content.component';

describe('AppInfoContentComponent', () => {
  let component: AppInfoContentComponent;
  let fixture: ComponentFixture<AppInfoContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppInfoContentComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: 'APP_VERSION',
          useValue: '0.0.0'
        },
        {
          provide: 'APP_NAME',
          useValue: 'Studio-Lite'
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AppInfoContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have injected APP_VERSION', () => {
    expect(component.appVersion).toBe('0.0.0');
  });

  it('should have injected APP_NAME', () => {
    expect(component.appName).toBe('Studio-Lite');
  });

  it('should accept isUserLoggedIn input', () => {
    component.isUserLoggedIn = true;
    fixture.detectChanges();

    expect(component.isUserLoggedIn).toBe(true);
  });

  it('should accept hasReviews input', () => {
    component.hasReviews = true;
    fixture.detectChanges();

    expect(component.hasReviews).toBe(true);
  });

  it('should accept userLongName input', () => {
    component.userLongName = 'Test User Name';
    fixture.detectChanges();

    expect(component.userLongName).toBe('Test User Name');
  });

  it('should accept userName input', () => {
    component.userName = 'testuser';
    fixture.detectChanges();

    expect(component.userName).toBe('testuser');
  });

  it('should accept isAdmin input', () => {
    component.isAdmin = true;
    fixture.detectChanges();

    expect(component.isAdmin).toBe(true);
  });

  it('should handle all boolean inputs as false by default', () => {
    expect(component.isUserLoggedIn).toBeUndefined();
    expect(component.hasReviews).toBeUndefined();
    expect(component.isAdmin).toBeUndefined();
  });

  it('should handle logged in admin user with reviews', () => {
    component.isUserLoggedIn = true;
    component.isAdmin = true;
    component.hasReviews = true;
    component.userName = 'admin';
    component.userLongName = 'Admin User';
    fixture.detectChanges();

    expect(component.isUserLoggedIn).toBe(true);
    expect(component.isAdmin).toBe(true);
    expect(component.hasReviews).toBe(true);
    expect(component.userName).toBe('admin');
    expect(component.userLongName).toBe('Admin User');
  });
});

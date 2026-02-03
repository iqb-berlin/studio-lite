// eslint-disable-next-line max-classes-per-file
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppInfoComponent } from './app-info.component';

describe('AppInfoComponent', () => {
  let component: AppInfoComponent;
  let fixture: ComponentFixture<AppInfoComponent>;
  let sanitizer: DomSanitizer;

  @Component({ selector: 'studio-lite-area-title', template: '', standalone: true })
  class MockAreaTitleComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-app-info-content', template: '', standalone: true })
  class MockAppInfoContentComponent {
    @Input() appTitle!: string;
    @Input() introHtml!: SafeUrl | undefined;
    @Input() userName!: string;
    @Input() userLongName!: string;
    @Input() isUserLoggedIn!: boolean;
    @Input() isAdmin!: boolean;
    @Input() hasReviews!: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MockAreaTitleComponent,
        MockAppInfoContentComponent
      ],
      providers: [
        provideRouter([]),
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

    fixture = TestBed.createComponent(AppInfoComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept appTitle input', () => {
    component.appTitle = 'Test Application';
    fixture.detectChanges();

    expect(component.appTitle).toBe('Test Application');
  });

  it('should accept introHtml input', () => {
    const htmlContent = sanitizer.sanitize(1, '<p>Test intro</p>');
    component.introHtml = htmlContent as SafeUrl;
    fixture.detectChanges();

    expect(component.introHtml).toBe(htmlContent);
  });

  it('should accept userName input', () => {
    component.userName = 'testuser';
    fixture.detectChanges();

    expect(component.userName).toBe('testuser');
  });

  it('should accept userLongName input', () => {
    component.userLongName = 'Test User';
    fixture.detectChanges();

    expect(component.userLongName).toBe('Test User');
  });

  it('should accept isUserLoggedIn input', () => {
    component.isUserLoggedIn = true;
    fixture.detectChanges();

    expect(component.isUserLoggedIn).toBe(true);
  });

  it('should accept isAdmin input', () => {
    component.isAdmin = true;
    fixture.detectChanges();

    expect(component.isAdmin).toBe(true);
  });

  it('should accept hasReviews input', () => {
    component.hasReviews = true;
    fixture.detectChanges();

    expect(component.hasReviews).toBe(true);
  });

  it('should handle all inputs with default values', () => {
    component.appTitle = 'Studio-Lite';
    component.userName = 'user';
    component.userLongName = 'Full Name';
    component.isUserLoggedIn = false;
    component.isAdmin = false;
    component.hasReviews = false;
    component.introHtml = undefined;
    fixture.detectChanges();

    expect(component.isUserLoggedIn).toBe(false);
    expect(component.isAdmin).toBe(false);
    expect(component.hasReviews).toBe(false);
  });
});

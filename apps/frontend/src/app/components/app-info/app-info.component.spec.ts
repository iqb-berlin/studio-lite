// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { AppInfoComponent } from './app-info.component';

describe('AppInfoComponent', () => {
  let component: AppInfoComponent;
  let fixture: ComponentFixture<AppInfoComponent>;

  @Component({ selector: 'studio-lite-area-title', template: '', standalone: false })
  class MockAreaTitleComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-app-info-content', template: '', standalone: false })
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
      declarations: [
        MockAreaTitleComponent,
        MockAppInfoContentComponent
      ],
      imports: [
        TranslateModule.forRoot()
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

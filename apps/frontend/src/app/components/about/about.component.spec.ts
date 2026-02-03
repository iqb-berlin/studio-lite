import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AboutComponent } from './about.component';
import { AppService } from '../../services/app.service';
import { AppConfig } from '../../models/app-config.class';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  let appService: AppService;
  let translateService: TranslateService;

  beforeEach(async () => {
    const titleServiceMock = {
      setTitle: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatCardModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        AppService,
        { provide: Title, useValue: titleServiceMock },
        {
          provide: 'APP_VERSION',
          useValue: '0.0.0'
        },
        {
          provide: 'APP_PUBLISHER',
          useValue: 'IQB - Institut zur Qualitätsentwicklung im Bildungswesen'
        },
        {
          provide: 'APP_NAME',
          useValue: 'Studio-Lite'
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    appService = TestBed.inject(AppService);
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct injected values', () => {
    expect(component.appName).toBe('Studio-Lite');
    expect(component.appPublisher).toBe('IQB - Institut zur Qualitätsentwicklung im Bildungswesen');
    expect(component.appVersion).toBe('0.0.0');
  });

  it('should have AppService injected', () => {
    expect(component.appService).toBeTruthy();
    expect(component.appService).toBeInstanceOf(AppService);
  });

  it('should set page title on init', done => {
    const translatedTitle = 'Imprint';
    jest.spyOn(translateService, 'instant').mockReturnValue(translatedTitle);
    jest.spyOn(appService.appConfig, 'setPageTitle');

    component.ngOnInit();

    setTimeout(() => {
      expect(translateService.instant).toHaveBeenCalledWith('home.imprint');
      expect(appService.appConfig.setPageTitle).toHaveBeenCalledWith(translatedTitle);
      done();
    }, 10);
  });

  it('should have appService with appConfig', () => {
    expect(appService.appConfig).toBeTruthy();
    expect(appService.appConfig).toBeInstanceOf(AppConfig);
  });
});

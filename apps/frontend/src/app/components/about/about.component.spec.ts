import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AboutComponent } from './about.component';
import { AppService } from '../../services/app.service';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

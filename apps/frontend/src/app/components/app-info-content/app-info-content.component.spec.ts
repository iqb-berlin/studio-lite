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
});

// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { SettingsComponent } from './settings.component';
import { environment } from '../../../../../environments/environment';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  @Component({ selector: 'studio-lite-app-config', template: '', standalone: false })
  class MockAppConfigComponent {}

  @Component({ selector: 'studio-lite-app-logo', template: '', standalone: false })
  class MockAppLogoComponent {}

  @Component({ selector: 'studio-lite-unit-export-config', template: '', standalone: false })
  class MockUnitExportComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockAppConfigComponent,
        MockAppLogoComponent,
        MockUnitExportComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        MatDatepickerModule,
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        MatDatepickerModule,
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

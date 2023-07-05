// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  @Component({ selector: 'studio-lite-app-config', template: '' })
  class MockAppConfigComponent {}

  @Component({ selector: 'studio-lite-app-logo', template: '' })
  class MockAppLogoComponent {}

  @Component({ selector: 'studio-lite-unit-export-config', template: '' })
  class MockUnitExportComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SettingsComponent,
        MockAppConfigComponent,
        MockAppLogoComponent,
        MockUnitExportComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule

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

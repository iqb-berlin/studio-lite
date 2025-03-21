// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { VeronaModuleClass } from '../../../shared/models/verona-module.class';
import { environment } from '../../../../../environments/environment';
import { UnitPropertiesComponent } from './unit-properties.component';

describe('UnitPropertiesComponent', () => {
  let component: UnitPropertiesComponent;
  let fixture: ComponentFixture<UnitPropertiesComponent>;

  @Component({ selector: 'studio-lite-new-group-button', template: '', standalone: false })
  class MockNewGroupButtonComponent {
    @Input() disabled!: boolean;
  }

  @Component({ selector: 'studio-lite-select-module', template: '', standalone: false })
  class MockSelectModuleComponent {
    @Input() modules!: { [key: string]: VeronaModuleClass };
    @Input() hidden!: boolean;
    @Input() stableOnly!: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockNewGroupButtonComponent,
        MockSelectModuleComponent
      ],
      imports: [
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatExpansionModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

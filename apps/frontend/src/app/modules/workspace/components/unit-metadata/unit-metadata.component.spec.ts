// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { VeronaModuleClass } from '../../../shared/models/verona-module.class';
import { environment } from '../../../../../environments/environment';
import { UnitMetadataComponent } from './unit-metadata.component';

describe('StartReviewButtonComponent', () => {
  let component: UnitMetadataComponent;
  let fixture: ComponentFixture<UnitMetadataComponent>;

  @Component({ selector: 'studio-lite-new-group-button', template: '' })
  class MockNewGroupButtonComponent {
    @Input() disabled!: boolean;
  }

  @Component({ selector: 'studio-lite-select-module', template: '' })
  class MockSelectModuleComponent {
    @Input() modules!: { [key: string]: VeronaModuleClass };
    @Input() hidden!: boolean;
    @Input() stableOnly!: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitMetadataComponent,
        MockNewGroupButtonComponent,
        MockSelectModuleComponent
      ],
      imports: [
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatCardModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

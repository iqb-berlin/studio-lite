// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { UnitsAreaComponent } from './units-area.component';

describe('UnitsAreaComponent', () => {
  let component: UnitsAreaComponent;
  let fixture: ComponentFixture<UnitsAreaComponent>;
  @Component({ selector: 'studio-lite-unit-save-button', template: '', standalone: false })
  class MockUnitSaveButtonComponent {}
  @Component({ selector: 'studio-lite-update-units-button', template: '', standalone: false })
  class MockUpdateUnitsButtonComponent {}
  @Component({ selector: 'studio-lite-unit-selection', template: '', standalone: false })
  class MockUnitSelectionComponent {
    @Input() selectedUnitId!: number;
    @Input() navLinks!: string[];
    @Input() unitList!: UnitInListDto[];
    @Input() selectedRouterLink!: number;
    @Input() unitGroupList!: number;
  }
  @Component({ selector: 'studio-lite-add-unit-button', template: '', standalone: false })
  class MockAddUnitButtonComponent {
    @Input() navLinks!: string[];
    @Input() selectedRouterLink!: number;
    @Input() selectedUnitId!: number;
  }
  @Component({ selector: 'studio-lite-delete-unit-button', template: '', standalone: false })
  class MockDeleteUnitButtonComponent {
    @Input() navLinks!: string[];
    @Input() selectedRouterLink!: number;
    @Input() selectedUnitId!: number;
  }
  @Component({ selector: 'studio-lite-edit-unit-button', template: '', standalone: false })
  class MockEditUnitButtonComponent {
    @Input() navLinks!: string[];
    @Input() selectedRouterLink!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockUnitSaveButtonComponent,
        MockUnitSelectionComponent,
        MockAddUnitButtonComponent,
        MockDeleteUnitButtonComponent,
        MockEditUnitButtonComponent,
        MockUpdateUnitsButtonComponent
      ],
      imports: [
        MatSnackBarModule,
        MatDialogModule,
        MatIconModule,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitsAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

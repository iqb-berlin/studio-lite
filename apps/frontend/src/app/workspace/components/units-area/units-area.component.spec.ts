// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { environment } from '../../../../environments/environment';
import { UnitsAreaComponent } from './units-area.component';

describe('UnitsAreaComponent', () => {
  let component: UnitsAreaComponent;
  let fixture: ComponentFixture<UnitsAreaComponent>;
  @Component({ selector: 'studio-lite-unit-save-button', template: '' })
  class MockUnitSaveButtonComponent {}
  @Component({ selector: 'studio-lite-update-units-button', template: '' })
  class MockUpdateUnitsButtonComponent {}
  @Component({ selector: 'studio-lite-unit-selection', template: '' })
  class MockUnitSelectionComponent {
    @Input() selectedUnitId!: number;
    @Input() navLinks!: string[];
    @Input() unitList!: UnitInListDto[];
    @Input() selectedRouterLink!: number;
  }
  @Component({ selector: 'studio-lite-add-unit-button', template: '' })
  class MockAddUnitButtonComponent {
    @Input() navLinks!: string[];
    @Input() selectedRouterLink!: number;
  }
  @Component({ selector: 'studio-lite-delete-unit-button', template: '' })
  class MockDeleteUnitButtonComponent {
    @Input() navLinks!: string[];
    @Input() selectedRouterLink!: number;
  }
  @Component({ selector: 'studio-lite-edit-unit-button', template: '' })
  class MockEditUnitButtonComponent {
    @Input() navLinks!: string[];
    @Input() selectedRouterLink!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitsAreaComponent,
        MockUnitSaveButtonComponent,
        MockUnitSelectionComponent,
        MockAddUnitButtonComponent,
        MockDeleteUnitButtonComponent,
        MockEditUnitButtonComponent,
        MockUpdateUnitsButtonComponent
      ],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatSnackBarModule,
        MatDialogModule,
        MatIconModule
      ],
      providers: [{
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

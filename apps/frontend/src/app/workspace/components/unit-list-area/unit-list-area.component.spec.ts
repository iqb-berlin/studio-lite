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
import { UnitListAreaComponent } from './unit-list-area.component';

describe('UnitListAreaComponent', () => {
  let component: UnitListAreaComponent;
  let fixture: ComponentFixture<UnitListAreaComponent>;
  @Component({ selector: 'studio-lite-unit-save-button', template: '' })
  class MockUnitSaveButtonComponent {}
  @Component({ selector: 'studio-lite-unit-list', template: '' })
  class MockUnitListComponent {
    @Input() selectedUnitId!: number;
    @Input() navLinks!: string[];
    @Input() unitList!: UnitInListDto[];
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
        UnitListAreaComponent,
        MockUnitSaveButtonComponent,
        MockUnitListComponent,
        MockAddUnitButtonComponent,
        MockDeleteUnitButtonComponent,
        MockEditUnitButtonComponent
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

    fixture = TestBed.createComponent(UnitListAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

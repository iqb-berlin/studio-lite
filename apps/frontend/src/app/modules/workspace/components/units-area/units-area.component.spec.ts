/* eslint-disable max-classes-per-file */
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, Params, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { UnitsAreaComponent } from './units-area.component';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitSelectionComponent } from '../unit-selection/unit-selection.component';

describe('UnitsAreaComponent', () => {
  let component: UnitsAreaComponent;
  let fixture: ComponentFixture<UnitsAreaComponent>;
  let workspaceServiceMock: WorkspaceService;
  let paramsSubject: BehaviorSubject<Params>;

  @Component({ selector: 'studio-lite-unit-save-button', template: '', standalone: true })
  class MockUnitSaveButtonComponent {}
  @Component({ selector: 'studio-lite-update-units-button', template: '', standalone: true })
  class MockUpdateUnitsButtonComponent {}
  @Component({ selector: 'studio-lite-unit-selection', template: '', standalone: true })
  class MockUnitSelectionComponent {
    @Input() selectedUnitId!: number;
    @Input() navLinks!: string[];
    @Input() unitList!: UnitInListDto[];
    @Input() selectedRouterLink!: number;
    @Input() unitGroupList!: number;
  }
  @Component({ selector: 'studio-lite-add-unit-button', template: '', standalone: true })
  class MockAddUnitButtonComponent {
    @Input() navLinks!: string[];
    @Input() selectedRouterLink!: number;
    @Input() selectedUnitId!: number;
  }
  @Component({ selector: 'studio-lite-delete-unit-button', template: '', standalone: true })
  class MockDeleteUnitButtonComponent {
    @Input() navLinks!: string[];
    @Input() selectedRouterLink!: number;
    @Input() selectedUnitId!: number;
  }
  @Component({ selector: 'studio-lite-edit-unit-button', template: '', standalone: true })
  class MockEditUnitButtonComponent {
    @Input() navLinks!: string[];
    @Input() selectedRouterLink!: number;
  }

  beforeEach(async () => {
    paramsSubject = new BehaviorSubject<Params>({});
    workspaceServiceMock = {
      resetUnitData: jest.fn(),
      selectedUnit$: new BehaviorSubject<number>(0)
    } as unknown as WorkspaceService;

    await TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        MatDialogModule,
        MatIconModule,
        TranslateModule.forRoot(),
        MockUnitSaveButtonComponent,
        MockUnitSelectionComponent,
        MockAddUnitButtonComponent,
        MockDeleteUnitButtonComponent,
        MockEditUnitButtonComponent,
        MockUpdateUnitsButtonComponent
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: WorkspaceService,
          useValue: workspaceServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: { params: paramsSubject }
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    })
      .overrideComponent(UnitsAreaComponent, {
        remove: { imports: [UnitSelectionComponent] },
        add: { imports: [MockUnitSelectionComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitsAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update selected unit when route params change', fakeAsync(() => {
    paramsSubject.next({ u: '123' });
    tick();

    expect(workspaceServiceMock.resetUnitData).toHaveBeenCalled();
    expect(workspaceServiceMock.selectedUnit$.getValue()).toBe(123);
  }));

  it('should set selected unit to 0 if param is invalid', fakeAsync(() => {
    paramsSubject.next({ u: 'abc' });
    tick();

    expect(workspaceServiceMock.selectedUnit$.getValue()).toBe(0);
  }));
});

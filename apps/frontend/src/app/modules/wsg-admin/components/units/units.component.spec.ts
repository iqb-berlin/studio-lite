import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UnitInViewDto } from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of } from 'rxjs';
import { AppService } from '../../../../services/app.service';
import { I18nService } from '../../../../services/i18n.service';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { BackendService } from '../../services/backend.service';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { UnitsComponent } from './units.component';

@Component({ selector: 'studio-lite-search-filter', template: '', standalone: true })
class MockSearchFilterComponent {
  @Input() title!: string;
  @Output() query = new EventEmitter<string>();
}

describe('UnitsComponent', () => {
  let component: UnitsComponent;
  let fixture: ComponentFixture<UnitsComponent>;
  let mockBackendService: {
    getAllUnitsForGroup: jest.Mock;
    deleteWorkspaceUnit: jest.Mock;
  };
  let mockWsgAdminService: {
    selectedWorkspaceGroupId: BehaviorSubject<number>;
  };
  let mockI18nService: unknown;
  let mockSnackBar: {
    open: jest.Mock;
  };
  let mockDialog: {
    open: jest.Mock;
  };
  let mockAppService: {
    dataLoading: boolean;
  };

  beforeEach(async () => {
    mockBackendService = {
      getAllUnitsForGroup: jest.fn().mockReturnValue(of([])),
      deleteWorkspaceUnit: jest.fn().mockReturnValue(of(true))
    };
    mockWsgAdminService = {
      selectedWorkspaceGroupId: new BehaviorSubject<number>(1)
    };
    mockI18nService = {};
    mockSnackBar = {
      open: jest.fn()
    };
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(false)
      })
    };
    mockAppService = {
      dataLoading: false
    };

    await TestBed.configureTestingModule({
      imports: [
        UnitsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        { provide: BackendService, useValue: mockBackendService },
        { provide: WsgAdminService, useValue: mockWsgAdminService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog },
        { provide: AppService, useValue: mockAppService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: {} } }
        }
      ]
    })
      .overrideComponent(UnitsComponent, {
        remove: { imports: [SearchFilterComponent] },
        add: { imports: [MockSearchFilterComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update units', () => {
    const units = [{ id: 1, key: 'u1', name: 'unit1' }] as UnitInViewDto[];
    mockBackendService.getAllUnitsForGroup.mockReturnValue(of(units));

    const updateUnits = (component as unknown as { updateUnits: () => void }).updateUnits;
    updateUnits.call(component);

    expect(mockBackendService.getAllUnitsForGroup).toHaveBeenCalledWith(1);
    expect(component.dataSource.data).toEqual(units);
  });

  it('should delete unit', () => {
    fixture.detectChanges();
    const unit = { id: 1, key: 'u1', workspaceId: 10 } as UnitInViewDto;

    mockDialog.open.mockReturnValue({
      afterClosed: () => of(true)
    });

    component.openDeleteDialog(unit);

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockBackendService.deleteWorkspaceUnit).toHaveBeenCalledWith(10, 1);
    expect(mockSnackBar.open).toHaveBeenCalledWith('wsg-admin.unit-deleted', '', expect.anything());
  });
});

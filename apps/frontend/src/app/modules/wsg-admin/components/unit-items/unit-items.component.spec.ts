import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { UnitItemInViewDto } from '@studio-lite-lib/api-dto';
import { UnitItemsComponent } from './unit-items.component';
import { BackendService } from '../../services/backend.service';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { I18nService } from '../../../../services/i18n.service';
import { AppService } from '../../../../services/app.service';

describe('UnitItemsComponent', () => {
  let component: UnitItemsComponent;
  let fixture: ComponentFixture<UnitItemsComponent>;
  let backendService: BackendService;
  let dialog: MatDialog;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UnitItemsComponent,
        TranslateModule.forRoot(),
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        MatSnackBarModule,
        MatTooltipModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: BackendService,
          useValue: {
            getAllUnitItemsForGroup: () => of([]),
            deleteUnitItem: () => of(true)
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: jest.fn().mockReturnValue({ afterClosed: () => of(true) })
          }
        },
        {
          provide: MatSnackBar,
          useValue: {
            open: jest.fn()
          }
        },
        {
          provide: WsgAdminService,
          useValue: {
            selectedWorkspaceGroupId: { value: 1 }
          }
        },
        {
          provide: I18nService,
          useValue: {
            dateTimeFormat: 'dd.MM.yyyy HH:mm',
            timeZone: 'Europe/Berlin'
          }
        },
        {
          provide: AppService,
          useValue: {
            dataLoading: false
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitItemsComponent);
    component = fixture.componentInstance;
    backendService = TestBed.inject(BackendService);
    dialog = TestBed.inject(MatDialog);
    snackBar = TestBed.inject(MatSnackBar);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update unit items on init', fakeAsync(() => {
    const mockItems: UnitItemInViewDto[] = [
      {
        uuid: '1',
        id: 'item1',
        unitId: 10,
        unitKey: 'UNIT-1',
        unitName: 'Unit 1',
        workspaceId: 100,
        workspaceName: 'Workspace 1',
        variableId: 'var1',
        variableReadOnlyId: 'var1',
        changedAt: new Date(),
        createdAt: new Date(),
        order: 1,
        locked: false,
        position: '1',
        weighting: 1,
        description: 'desc'
      }
    ];
    const spy = jest.spyOn(backendService, 'getAllUnitItemsForGroup').mockReturnValue(of(mockItems));

    component.ngOnInit();
    tick();

    expect(spy).toHaveBeenCalledWith(1);
    expect(component.dataSource.data).toEqual(mockItems);
  }));

  it('should format UUID correctly', () => {
    const uuid = '12345678-90ab-cdef-1234-567890abcdef';
    expect(component.formatUuid(uuid)).toBe('123...def');
  });

  it('should open delete dialog', () => {
    const item = { uuid: '123', workspaceId: 1, unitId: 1 } as unknown as UnitItemInViewDto;
    const dialogSpy = jest.spyOn(dialog, 'open');
    component.openDeleteDialog(item);
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should call backend service delete on confirmation', fakeAsync(() => {
    const item = { uuid: '123', workspaceId: 1, unitId: 1 } as unknown as UnitItemInViewDto;
    const deleteSpy = jest.spyOn(backendService, 'deleteUnitItem').mockReturnValue(of(true));
    const snackBarSpy = jest.spyOn(snackBar, 'open');

    // Mock dialog to return true
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as unknown as never);

    component.openDeleteDialog(item);
    tick();

    expect(deleteSpy).toHaveBeenCalledWith(1, 1, '123');
    expect(snackBarSpy).toHaveBeenCalledWith('wsg-admin.unit-item-deleted', 'OK', { duration: 3000 });
  }));

  it('should show error snackbar if deletion fails', fakeAsync(() => {
    const item = { uuid: '123', workspaceId: 1, unitId: 1 } as unknown as UnitItemInViewDto;
    jest.spyOn(backendService, 'deleteUnitItem').mockReturnValue(of(false));
    const snackBarSpy = jest.spyOn(snackBar, 'open');

    // Mock dialog to return true
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as unknown as never);

    component.openDeleteDialog(item);
    tick();

    expect(snackBarSpy).toHaveBeenCalledWith('wsg-admin.unit-item-not-deleted', 'OK', { duration: 3000 });
  }));
});

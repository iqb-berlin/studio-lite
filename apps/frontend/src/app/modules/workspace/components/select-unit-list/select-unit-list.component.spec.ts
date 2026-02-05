import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Component } from '@angular/core';
import { provideHttpClient, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { environment } from '../../../../../environments/environment';
import { SelectUnitListComponent } from './select-unit-list.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';

describe('SelectUnitListComponent', () => {
  let component: SelectUnitListComponent;
  let fixture: ComponentFixture<SelectUnitListComponent>;
  let backendServiceMock: jest.Mocked<WorkspaceBackendService>;

  @Component({ selector: 'studio-lite-search-filter', template: '', standalone: false })
  class MockSearchFilterComponent {
    value: string = '';
  }

  const createUnits = (): UnitInListDto[] => ([
    {
      id: 1, key: 'U1', name: 'Unit 1', groupName: 'G1'
    },
    {
      id: 2, key: 'U2', name: 'Unit 2', groupName: 'G1'
    },
    {
      id: 3, key: 'U3', name: 'Unit 3', groupName: 'G2'
    }
  ]);

  beforeEach(async () => {
    backendServiceMock = {
      getUnitList: jest.fn().mockReturnValue(of(createUnits()))
    } as unknown as jest.Mocked<WorkspaceBackendService>;

    await TestBed.configureTestingModule({
      declarations: [
        MockSearchFilterComponent
      ],
      imports: [
        MatTooltipModule,
        MatTableModule,
        MatIconModule,
        MatCheckboxModule,
        MatInputModule,
        MatFormFieldModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: WorkspaceBackendService,
          useValue: backendServiceMock
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectUnitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update unit list and set initial selection', () => {
    component.initialSelection = [2];
    component.queryParams = new HttpParams();

    const emitSpy = jest.spyOn(component.selectionChanged, 'emit');

    component.updateUnitList(10);

    expect(backendServiceMock.getUnitList).toHaveBeenCalledWith(10, component.queryParams);
    expect(component.objectsDatasource.data.length).toBe(3);
    expect(component.selectedUnitIds).toEqual([2]);
    expect(emitSpy).toHaveBeenCalledWith([2]);
  });

  it('should apply filter to datasource', () => {
    component.filter = [1, 3];
    component.queryParams = new HttpParams();

    component.updateUnitList(10);

    expect(component.objectsDatasource.data.length).toBe(2);
  });

  it('should toggle master selection', () => {
    component.queryParams = new HttpParams();
    component.updateUnitList(10);

    component.masterToggle();
    expect(component.selectionCount).toBe(3);

    component.masterToggle();
    expect(component.selectionCount).toBe(0);
  });

  it('should deselect disabled units', () => {
    component.queryParams = new HttpParams();
    component.updateUnitList(10);

    component.selectedUnitIds = [1, 2, 3];
    component.disabled = [2];

    expect(component.selectedUnitIds).toEqual([1, 3]);
  });
});

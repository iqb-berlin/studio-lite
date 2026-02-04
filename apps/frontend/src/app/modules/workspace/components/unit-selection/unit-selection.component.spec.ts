/* eslint-disable max-classes-per-file */
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Sort, MatSortHeader } from '@angular/material/sort';
import { of, Subject } from 'rxjs';
import { UnitSelectionComponent } from './unit-selection.component';
import { environment } from '../../../../../environments/environment';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { UnitTableComponent } from '../unit-table/unit-table.component';
import { UnitGroupsComponent } from '../unit-groups/unit-groups.component';
import { UnitGroupComponent } from '../unit-group/unit-group.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';

@Component({ selector: 'studio-lite-unit-table', template: '', standalone: true })
class MockUnitTableComponent {
  @Input() hasSortHeader!: boolean;
  @Input() unitList!: UnitInListDto[];
  sortHeader = {} as MatSortHeader;
  sort = jest.fn();
}

@Component({ selector: 'studio-lite-search-filter', template: '', standalone: true })
class MockSearchFilterComponent {
  value: string = '';
}

@Component({ selector: 'studio-lite-unit-groups', template: '', standalone: true })
class MockUnitGroupsComponent {
  @Input() expandedGroups !: number;
  @Input() numberOfGroups !: number;
  @Input() groupsInfo !: string;
  @Input('unitGroupList') unitGroupList!: unknown;
}

@Component({ selector: 'studio-lite-unit-group', template: '', standalone: true })
class MockUnitGroupComponent {
  @Input() count!: number;
  @Input() title!: string;
  @Input() expandAll!: unknown;
}

describe('UnitSelectionComponent', () => {
  let component: UnitSelectionComponent;
  let fixture: ComponentFixture<UnitSelectionComponent>;
  let workspaceServiceMock: WorkspaceService;
  let backendServiceMock: WorkspaceBackendService;

  beforeEach(async () => {
    workspaceServiceMock = {
      onCommentsUpdated: new Subject<void>(),
      workspaceSettings: { unitGroups: [] },
      selectedWorkspaceId: 1,
      resetUnitList: jest.fn(),
      selectedUnit$: new Subject<number>()
    } as unknown as WorkspaceService;

    backendServiceMock = {
      getUnitGroups: jest.fn().mockReturnValue(of([])),
      getUnitList: jest.fn().mockReturnValue(of([]))
    } as unknown as WorkspaceBackendService;

    const routerMock: Router = {
      navigate: jest.fn().mockResolvedValue(true),
      routerState: { snapshot: { url: '/a/1' } }
    } as unknown as Router;

    await TestBed.configureTestingModule({
      imports: [
        UnitSelectionComponent,
        TranslateModule.forRoot(),
        MockUnitTableComponent,
        MockSearchFilterComponent,
        MockUnitGroupsComponent,
        MockUnitGroupComponent
      ],
      providers: [
        provideHttpClient(),
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { parent: {}, root: {} } },
        { provide: WorkspaceService, useValue: workspaceServiceMock },
        { provide: WorkspaceBackendService, useValue: backendServiceMock },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    })
      .overrideComponent(UnitSelectionComponent, {
        remove: {
          imports: [
            UnitGroupsComponent,
            SearchFilterComponent,
            UnitTableComponent,
            UnitGroupComponent
          ]
        },
        add: {
          imports: [
            MockUnitGroupsComponent,
            MockSearchFilterComponent,
            MockUnitTableComponent,
            MockUnitGroupComponent
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate stats when setting unitList', () => {
    component.setU = {
      'Group 1': [{ id: 1 }, { id: 2 }] as UnitInListDto[],
      'Group 2': [{ id: 3 }] as UnitInListDto[]
    };
    expect(component.numberOfGroups).toBe(2);
    expect(component.numberOfUnits).toBe(3);
    expect(component.expandedGroups).toBe(2);
    expect(component.groupsInfo).toContain('2 workspace.groups');
    expect(component.groupsInfo).toContain('3 workspace.units');
  });

  it('should update unit list on comments updated', fakeAsync(() => {
    const updateSpy = jest.spyOn(component, 'updateUnitList');
    component.ngOnInit();
    (workspaceServiceMock.onCommentsUpdated as Subject<void>).next();
    tick();
    expect(updateSpy).toHaveBeenCalled();
  }));

  it('should update expandedGroups count on change', () => {
    component.expandedGroups = 5;
    component.onExpandedChange(true);
    expect(component.expandedGroups).toBe(6);

    component.onExpandedChange(false);
    expect(component.expandedGroups).toBe(5);
  });

  it('should propagate sort event to other tables', () => {
    const table1 = new MockUnitTableComponent() as unknown as UnitTableComponent;
    const table2 = new MockUnitTableComponent() as unknown as UnitTableComponent;
    const table3 = new MockUnitTableComponent() as unknown as UnitTableComponent;

    // The component types unitTables as UnitTableComponent[], so we provide an array
    component.unitTables = [table1, table2, table3];

    const sortEvent = { sortState: {} as Sort, table: table1 };
    component.sortUnitTables(sortEvent);

    expect(table1.sortHeader).toBeDefined();
    expect(table1.sort).not.toHaveBeenCalled();
    expect(table2.sort).toHaveBeenCalled();
    expect(table3.sort).toHaveBeenCalled();
  });
});

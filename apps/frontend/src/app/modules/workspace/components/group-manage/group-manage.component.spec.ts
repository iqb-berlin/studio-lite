/* eslint-disable max-classes-per-file */
import {
  ComponentFixture, fakeAsync, flush, TestBed
} from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { GroupManageComponent } from './group-manage.component';
import { environment } from '../../../../../environments/environment';
import { WorkspaceService } from '../../services/workspace.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { GroupMenuComponent } from '../group-menu/group-menu.component';
import { SaveChangesComponent } from '../save-changes/save-changes.component';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';

class MockWorkspaceService {
  selectedWorkspaceId = 1;
}

class MockAppService {
  dataLoading = false;
}

describe('GroupManageComponent', () => {
  let component: GroupManageComponent;
  let fixture: ComponentFixture<GroupManageComponent>;
  let backendService: DeepMocked<WorkspaceBackendService>;
  let snackBar: DeepMocked<MatSnackBar>;

  @Component({ selector: 'studio-lite-select-unit-list', template: '', standalone: true })
  class MockSelectUnitListComponent {
    @Input() disabled!: number[];
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() workspace!: unknown;
    @Input('show-groups') showGroups!: boolean;
    @Input() selectionCount!: number;
    @Input() selectedUnitId!: number;
  }

  @Component({ selector: 'studio-lite-save-changes', template: '', standalone: true })
  class MockSaveChangesComponent {
    @Input() changed!: boolean;
  }

  @Component({ selector: 'studio-lite-group-menu', template: '', standalone: true })
  class MockGroupMenuComponent {
    @Input() selectedGroup!: string;
  }

  @Component({ selector: 'studio-lite-search-filter', template: '', standalone: true })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  beforeEach(async () => {
    snackBar = createMock<MatSnackBar>();
    backendService = createMock<WorkspaceBackendService>({
      getUnitList: jest.fn().mockReturnValue(of([])),
      getUnitGroups: jest.fn().mockReturnValue(of([]))
    });

    await TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot(),
        MockGroupMenuComponent,
        MockSelectUnitListComponent,
        MockSearchFilterComponent,
        MockSaveChangesComponent
      ],
      providers: [
        provideHttpClient(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: WorkspaceService, useClass: MockWorkspaceService },
        { provide: AppService, useClass: MockAppService },
        { provide: WorkspaceBackendService, useValue: backendService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    })
      .overrideComponent(GroupManageComponent, {
        remove: {
          imports: [
            GroupMenuComponent,
            SelectUnitListComponent,
            SearchFilterComponent,
            SaveChangesComponent
          ]
        },
        add: {
          imports: [
            MockGroupMenuComponent,
            MockSelectUnitListComponent,
            MockSearchFilterComponent,
            MockSaveChangesComponent
          ]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupManageComponent);
    component = fixture.componentInstance;
  });

  const unit = (id: number, groupName: string): UnitInListDto => createMock<UnitInListDto>({ id, groupName });

  it.each([
    [[2, 3], true],
    [[1], true],
    [[4, 1], false]
  ])('should take a selection of units %j instead of [1, 4] as changed: %s (#1963)', (selectedUnitIds, changed) => {
    component.groupUnitsOriginal = [1, 4];
    component.unitSelectionTable = createMock<SelectUnitListComponent>({ selectedUnitIds });

    component.unitSelectionChanged();

    expect(component.changed).toBe(changed);
  });

  it('should list the groups of the units and the empty groups of the workspace when opened (#1973)', fakeAsync(() => {
    backendService.getUnitList.mockReturnValue(of([unit(1, 'Alpha'), unit(2, 'Alpha'), unit(3, 'Beta'), unit(4, '')]));
    backendService.getUnitGroups.mockReturnValue(of(['Gamma', 'Alpha']));

    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.group-row'));
    expect(rows.map(row => row.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['Alpha 2', 'Beta 1', 'Gamma']);
  }));

  // A group needs a name of two characters at least; a shorter one is refused before the backend (#1973).
  it.each<[string, (manage: GroupManageComponent) => void, string]>([
    ["add ''", manage => manage.addGroup(''), 'workspace.new-group-not-saved'],
    ["add 'a'", manage => manage.addGroup('a'), 'workspace.new-group-not-saved'],
    ["rename to ''", manage => manage.renameGroup(''), 'workspace.group-not-renamed'],
    ["rename to 'a'", manage => manage.renameGroup('a'), 'workspace.group-not-renamed']
  ])('should refuse to %s', (_, act, message) => {
    act(component);

    expect(backendService.addUnitGroup).not.toHaveBeenCalled();
    expect(backendService.renameUnitGroup).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(message, 'error', { duration: 3000 });
  });

  it('should pass a name of two characters to the backend', () => {
    backendService.addUnitGroup.mockReturnValue(of(true));

    component.addGroup('ab');

    expect(backendService.addUnitGroup).toHaveBeenCalledWith(1, 'ab');
  });

  it('should select a renamed group with its units in the unit list', () => {
    backendService.getUnitList.mockReturnValue(of([unit(1, 'A2'), unit(2, 'A2'), unit(3, 'B')]));
    backendService.renameUnitGroup.mockReturnValue(of(true));
    const unitList = createMock<SelectUnitListComponent>({ selectedUnitIds: [] });
    component.unitSelectionTable = unitList;
    component.selectedGroup = 'A';

    component.renameGroup('A2');

    expect(backendService.renameUnitGroup).toHaveBeenCalledWith(1, 'A', 'A2');
    expect(component.selectedGroup).toBe('A2');
    expect(unitList.selectedUnitIds).toEqual([1, 2]);
  });

  type GroupCall = 'addUnitGroup' | 'renameUnitGroup' | 'deleteUnitGroup';
  it.each<[string, GroupCall, (manage: GroupManageComponent) => void, string]>([
    ['add', 'addUnitGroup', manage => manage.addGroup('Neu'), 'workspace.new-group-not-saved'],
    ['rename', 'renameUnitGroup', manage => manage.renameGroup('Neu'), 'workspace.group-not-renamed'],
    ['delete', 'deleteUnitGroup', manage => manage.deleteGroup(), 'workspace.group-not-deleted']
  ])('should say when the backend refuses to %s a group', (_, method, act, message) => {
    backendService[method].mockReturnValue(of(false));

    act(component);

    expect(backendService[method]).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(message, 'error', { duration: 3000 });
  });

  it('should filter the groups by any part of their name regardless of case', fakeAsync(() => {
    backendService.getUnitGroups.mockReturnValue(of(['Neue Gruppe', 'Beta']));
    fixture.detectChanges();
    flush();

    component.objectsDatasource.filter = 'gru';
    fixture.detectChanges();

    const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.group-row'));
    expect(rows.map(row => row.textContent?.trim())).toEqual(['Neue Gruppe']);
  }));

  it('should keep the group selected with its units after saving them', () => {
    backendService.getUnitList.mockReturnValue(of([unit(1, 'A'), unit(2, 'A'), unit(3, 'B')]));
    backendService.setGroupUnits.mockReturnValue(of(true));
    const unitList = createMock<SelectUnitListComponent>({ selectedUnitIds: [1, 2] });
    component.unitSelectionTable = unitList;
    component.selectedGroup = 'A';
    component.groupUnitsToChange = [1, 2];

    component.saveChanged();

    expect(backendService.setGroupUnits).toHaveBeenCalledWith(1, 'A', [1, 2]);
    expect(backendService.getUnitList).toHaveBeenCalledWith(1);
    expect(component.selectedGroup).toBe('A');
    expect(unitList.selectedUnitIds).toEqual([1, 2]);
    expect(snackBar.open).toHaveBeenCalledWith('workspace.group-saved', '', { duration: 1000 });
  });

  it('should say when the backend refuses to save the units of a group', () => {
    backendService.setGroupUnits.mockReturnValue(of(false));
    component.selectedGroup = 'A';
    component.groupUnitsToChange = [1, 2];

    component.saveChanged();

    expect(backendService.getUnitList).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith('workspace.group-not-saved', 'error', { duration: 3000 });
  });

  it('should reload the groups with none selected after deleting one', () => {
    backendService.deleteUnitGroup.mockReturnValue(of(true));
    const unitList = createMock<SelectUnitListComponent>({ selectedUnitIds: [1] });
    component.unitSelectionTable = unitList;
    component.selectedGroup = 'A';

    component.deleteGroup();

    expect(backendService.deleteUnitGroup).toHaveBeenCalledWith(1, 'A');
    expect(backendService.getUnitGroups).toHaveBeenCalledWith(1);
    expect(component.selectedGroup).toBe('');
    expect(unitList.selectedUnitIds).toEqual([]);
    expect(snackBar.open).toHaveBeenCalledWith('workspace.group-deleted', '', { duration: 1000 });
  });
});

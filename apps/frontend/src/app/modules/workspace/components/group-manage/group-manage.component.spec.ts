/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
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

class MockWorkspaceBackendService {
  getUnitList() {
    return of([]);
  }

  getUnitGroups() {
    return of([]);
  }
}

describe('GroupManageComponent', () => {
  let component: GroupManageComponent;
  let fixture: ComponentFixture<GroupManageComponent>;

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
        { provide: WorkspaceBackendService, useClass: MockWorkspaceBackendService }
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load groups on init', fakeAsync(() => {
    component.ngOnInit();
    tick(); // for setTimeout
    expect(component.groups).toBeDefined();
  }));
});

// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { WorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { WorkspacesComponent } from './workspaces.component';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { environment } from '../../../../../environments/environment';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { WorkspacesMenuComponent } from '../workspaces-menu/workspaces-menu.component';
import { I18nService } from '../../../../services/i18n.service';

describe('WorkspacesComponent', () => {
  let component: WorkspacesComponent;
  let fixture: ComponentFixture<WorkspacesComponent>;
  let mockBackendService: Partial<BackendService>;
  let mockAppService: Partial<AppService>;

  @Component({ selector: 'studio-lite-search-filter', template: '', standalone: true })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-workspaces-menu', template: '', standalone: true })
  class MockWorkspacesMenuComponent {
    @Output() downloadWorkspacesReport = new EventEmitter();
  }

  beforeEach(async () => {
    mockBackendService = {
      getAllWorkspaces: jest.fn().mockReturnValue(of([{ id: 1, name: 'ws1', groupId: 1 }])),
      getXlsWorkspaces: jest.fn().mockReturnValue(of(new Blob(['content'])))
    };

    mockAppService = {
      dataLoading: false
    };

    await TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        TranslateModule.forRoot(),
        WorkspacesComponent,
        MockSearchFilterComponent,
        MockWorkspacesMenuComponent
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: BackendService, useValue: mockBackendService },
        { provide: AppService, useValue: mockAppService },
        { provide: I18nService, useValue: { fullLocale: 'en-US', fileDateFormat: 'yyyy-MM-dd' } }
      ]
    })
      .overrideComponent(WorkspacesComponent, {
        remove: { imports: [SearchFilterComponent, WorkspacesMenuComponent] },
        add: { imports: [MockSearchFilterComponent, MockWorkspacesMenuComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkspacesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load workspaces on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockBackendService.getAllWorkspaces).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.displayedColumns).toContain('notes');
  });

  it('isRouteHidden should determine correctly', () => {
    const ws = {
      id: 1,
      settings: {
        hiddenRoutes: ['preview']
      }
    } as WorkspaceFullDto;
    expect(component.isRouteHidden(ws, 'preview')).toBe(true);
    expect(component.isRouteHidden(ws, 'editor')).toBe(false);

    ws.settings = undefined;
    expect(component.isRouteHidden(ws, 'editor')).toBe(false);
  });

  it('should download workspaces report', () => {
    component.xlsxDownloadWorkspaceReport();
    expect(mockBackendService.getXlsWorkspaces).toHaveBeenCalled();
  });
});

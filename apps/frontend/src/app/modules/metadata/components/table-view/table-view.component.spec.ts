import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTab, MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatSortModule } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { MDProfileGroup } from '@iqb/metadata';
import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { TableViewComponent } from './table-view.component';
import { MetadataService } from '../../services/metadata.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { I18nService } from '../../../../services/i18n.service';

interface ColumnValues {
  key?: string;
  id?: string;
  variableId?: string | null;
  weighting?: string;
  description?: string;
  [key: string]: string | null | undefined;
}

describe('TableViewComponent', () => {
  let component: TableViewComponent;
  let fixture: ComponentFixture<TableViewComponent>;
  let mockMetadataService: Partial<MetadataService>;
  let mockWorkspaceService: Partial<WorkspaceService>;
  let mockI18nService: Partial<I18nService>;

  beforeEach(async () => {
    mockMetadataService = {
      itemProfileColumns: { entries: [] } as unknown as MDProfileGroup,
      unitProfileColumns: [],
      downloadMetadataReport: jest.fn().mockReturnValue(of(new Blob()))
    };
    mockWorkspaceService = {
      selectedWorkspaceId: 1
    };
    mockI18nService = {
      fullLocale: 'de-DE',
      fileDateFormat: 'yyyy-MM-dd'
    };

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatTableModule,
        MatTabsModule,
        MatSortModule,
        MatSnackBarModule,
        TranslateModule.forRoot(),
        TableViewComponent
      ],
      providers: [
        { provide: MetadataService, useValue: mockMetadataService },
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        { provide: I18nService, useValue: mockI18nService },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { units: [], warning: '' }
        },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data source on ngOnInit', () => {
    component.data = { units: [{ id: 1, key: 'K1' } as unknown as UnitPropertiesDto], warning: '' };
    component.ngOnInit();
    expect(component.dataSource.data.length).toBe(1);
  });

  it('should change view mode on tabChanged', () => {
    component.tabChanged({ index: 1, tab: null as unknown as MatTab } as MatTabChangeEvent);
    expect(component.viewMode).toBe('items');

    component.tabChanged({ index: 0, tab: null as unknown as MatTab } as MatTabChangeEvent);
    expect(component.viewMode).toBe('units');
  });

  it('should apply filter to data source', () => {
    component.dataSource = new MatTableDataSource<ColumnValues>([]);
    const event = { target: { value: ' test ' } } as unknown as Event;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('test');
  });
});

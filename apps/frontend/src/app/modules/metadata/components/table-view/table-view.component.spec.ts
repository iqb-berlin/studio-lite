import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { MatTab, MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MDProfileGroup } from '@iqbspecs/metadata-profile';
import { ItemsMetadataValues, MetadataValuesEntry, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { saveAs } from 'file-saver-es';
import { TableViewComponent } from './table-view.component';
import { MetadataService } from '../../services/metadata.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { I18nService } from '../../../../services/i18n.service';
import { TextSortTableDataSource } from '../../../../models/text-sort-table-data-source.class';
import { buildXlsxFile } from '../../../../utils/xlsx-file.utils';

jest.mock('file-saver-es', () => ({ saveAs: jest.fn() }));
jest.mock('../../../../utils/xlsx-file.utils', () => ({ buildXlsxFile: jest.fn() }));

interface ColumnValues {
  key?: string;
  id?: string;
  variableId?: string | null;
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
      unitProfileColumns: []
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

  it('should initialize data source on ngOnInit', () => {
    component.data = { units: [{ id: 1, key: 'K1' } as unknown as UnitPropertiesDto], warning: '' };
    component.ngOnInit();
    expect(component.dataSource.data.length).toBe(1);
  });

  // The report lacks the columns of a profile that could not be loaded, and says so (#2002).
  it.each([['Metadatenprofil "p" kann aktuell nicht geladen werden', 1], ['', 0]])(
    'shows the warning "%s" above the tables',
    (warning, shown) => {
      component.data = { units: [], warning };
      fixture.detectChanges();

      const hints: HTMLElement[] = Array.from(
        fixture.nativeElement.querySelectorAll('[data-cy="metadata-table-view-profile-not-loaded"]')
      );
      expect(hints).toHaveLength(shown);
      expect(hints.map(hint => hint.textContent?.trim())).toEqual(warning ? [warning] : []);
    }
  );

  it('should change view mode on tabChanged', () => {
    component.tabChanged({ index: 1, tab: null as unknown as MatTab } as MatTabChangeEvent);
    expect(component.viewMode).toBe('items');

    component.tabChanged({ index: 0, tab: null as unknown as MatTab } as MatTabChangeEvent);
    expect(component.viewMode).toBe('units');
  });

  it('should apply filter to data source', () => {
    component.dataSource = new TextSortTableDataSource<ColumnValues>([]);
    const event = { target: { value: ' test ' } } as unknown as Event;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('test');
  });

  it('keys cell values under the same resolved label as the column header', () => {
    // 'de' deliberately NOT at index 0 to expose the label[0] vs extractLabelText mismatch
    const label = [
      { lang: 'en', value: 'Task time' },
      { lang: 'de', value: 'Aufgabenzeit' }
    ];
    mockMetadataService.unitProfileColumns = [
      {
        label,
        entries: [{
          id: 'e1', label, type: 'text', parameters: null
        }]
      }
    ] as unknown as MDProfileGroup[];
    const unit = {
      id: 1,
      key: 'K1',
      metadata: {
        profiles: [{ order: 0, entries: [{ label, valueAsText: { value: '42' } }] }]
      }
    } as unknown as UnitPropertiesDto;

    component.data = { units: [unit], warning: '' };
    component.tabChanged({ index: 0, tab: null as unknown as MatTab } as MatTabChangeEvent);

    expect(component.columnsToDisplay).toContain('Aufgabenzeit');
    expect(component.dataSource.data[0]).toMatchObject({ Aufgabenzeit: '42' });
  });

  describe('rows and report', () => {
    const tab = (index: number) => ({ index, tab: null as unknown as MatTab } as MatTabChangeEvent);
    const text = (value: string) => [{ lang: 'de', value }];
    const entry = (label: string, valueAsText: MetadataValuesEntry['valueAsText']): MetadataValuesEntry => ({
      id: label, label: text(label), value: '', valueAsText
    });
    const group = (label: string): MDProfileGroup => ({
      label: [],
      entries: [{
        id: label, label: text(label), type: 'TEXT', parameters: null
      }]
    });
    const link = (unitId: number, key: string) => `<a href=#/a/1/${unitId}>${key}</a>`;

    it('should list one row per item, with the values of its current profile only', () => {
      const items: ItemsMetadataValues[] = [
        { id: 'I1', variableId: 'v1', profiles: [{ order: 0, entries: [entry('Zeit', { lang: 'de', value: '30' })] }] },
        { variableId: 'v2', description: 'ohne Profil' },
        { id: 'I3', profiles: [{ order: -1, entries: [entry('Zeit', { lang: 'de', value: '99' })] }] }
      ];
      component.data = {
        units: [
          { id: 1, key: 'K1', metadata: { items } },
          { id: 2, key: 'K2', metadata: {} }
        ],
        warning: ''
      };

      component.tabChanged(tab(1));

      expect(component.dataSource.data).toEqual([
        {
          key: link(1, 'K1'), id: 'I1', variableId: 'v1', description: '', Zeit: '30'
        },
        {
          key: link(1, 'K1'), id: '–', variableId: 'v2', description: 'ohne Profil'
        },
        { key: link(1, 'K1'), id: 'I3' }
      ]);
    });

    it('should show several values of one field line by line, and a single one as it is', () => {
      const entries = [
        entry('Themen', [{ lang: 'de', value: 'Zahlen' }, { lang: 'de', value: 'Raum' }]),
        entry('Stufe', [{ lang: 'de', value: 'II' }])
      ];
      component.data = {
        units: [{ id: 1, key: 'K1', metadata: { profiles: [{ order: 0, entries }] } }],
        warning: ''
      };

      component.tabChanged(tab(0));

      expect(component.dataSource.data).toEqual([{ key: link(1, 'K1'), Themen: 'Zahlen<br>Raum', Stufe: 'II' }]);
    });

    const sortedBy = (column: string): ColumnValues[] => component.dataSource.sortData(
      [...component.dataSource.data],
      { active: column, direction: 'asc' } as MatSort
    );

    it('should sort the units by their key, not by the address of their link (#1872)', () => {
      // loaded in the order of the keys; sorted by the link, unit 100 came first and 9 last
      component.data = {
        units: [{ id: 100, key: 'Aa' }, { id: 9, key: 'ab' }, { id: 12, key: 'Zz' }],
        warning: ''
      };
      component.tabChanged(tab(0));
      component.dataSource.data.reverse();

      expect(sortedBy('key').map(row => row.key)).toEqual([link(100, 'Aa'), link(9, 'ab'), link(12, 'Zz')]);
    });

    it('should read a number in a profile field as a number, and an item id as text (#1872)', () => {
      const field = 'Schwierigkeit';
      const item = (id: string, value: string): ItemsMetadataValues => ({
        id, profiles: [{ order: 0, entries: [entry(field, { lang: 'de', value })] }]
      });
      component.data = {
        units: [{ id: 1, key: 'K1', metadata: { items: [item('1.10', '0.5'), item('1.9', '0.25')] } }],
        warning: ''
      };
      component.tabChanged(tab(1));

      expect(sortedBy(field).map(row => row[field])).toEqual(['0.25', '0.5']);
      expect(sortedBy('id').map(row => row.id)).toEqual(['1.9', '1.10']);
    });

    // The file is the table as it is shown, in the language of the interface (#2181).
    it.each<[string, number, string, string[], string]>([
      ['unit', 0, 'metadata.units', ['metadata.key', 'Zeit'], 'metadata.unitMetadataReportFileName.xlsx'],
      ['item', 1, 'metadata.items', [
        'metadata.key', 'metadata.id', 'metadata.variableId', 'metadata.description', 'Schwierigkeit'
      ], 'metadata.itemsMetadataReportFileName.xlsx']
    ])('should save the %s report from tab %i under the headers of the table', async (
      _,
      index,
      sheetName,
      headers,
      fileName
    ) => {
      const file = new Blob(['xlsx']);
      jest.mocked(buildXlsxFile).mockResolvedValue(file);
      mockI18nService.fullLocale = 'en-US'; // the locale whose data Angular brings along
      mockMetadataService.unitProfileColumns = [group('Zeit')];
      mockMetadataService.itemProfileColumns = group('Schwierigkeit');
      component.data = {
        units: [{ id: 1, key: 'K1' }, { id: 2, key: 'K2' }],
        warning: ''
      };
      component.tabChanged(tab(index));

      await component.downloadMetadata();

      expect(jest.mocked(buildXlsxFile).mock.lastCall?.[0]).toBe(sheetName);
      expect(jest.mocked(buildXlsxFile).mock.lastCall?.[1].map(column => column.header)).toEqual(headers);
      expect(saveAs).toHaveBeenCalledWith(file, fileName);
    });

    // Built by the API, the file listed every unit in the order loaded, with the values under the label
    // the API took for the column, which was not always the one the table shows.
    it('should write the rows the table shows, filtered and sorted, the unit by its key (#2181)', async () => {
      jest.mocked(buildXlsxFile).mockResolvedValue(new Blob());
      mockI18nService.fullLocale = 'en-US'; // the locale whose data Angular brings along
      mockMetadataService.unitProfileColumns = [group('Themen')];
      const themes = (...values: string[]) => ({
        profiles: [{ order: 0, entries: [entry('Themen', values.map(value => ({ lang: 'de', value })))] }]
      });
      component.data = {
        units: [
          { id: 1, key: 'K1', metadata: themes('Zahlen', 'Raum') },
          { id: 2, key: 'K2', metadata: themes('Raum') },
          { id: 3, key: 'K3', metadata: themes('Zahlen') }
        ],
        warning: ''
      };
      component.tabChanged(tab(0));
      component.dataSource.filter = 'raum';
      component.dataSource.sort = TestBed.runInInjectionContext(() => new MatSort());
      component.dataSource.sort.active = 'key';
      component.dataSource.sort.direction = 'desc';

      await component.downloadMetadata();

      expect(jest.mocked(buildXlsxFile).mock.lastCall?.[2]).toEqual([
        { key: 'K2', Themen: 'Raum' },
        { key: 'K1', Themen: 'Zahlen\nRaum' }
      ]);
    });
  });
});

import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatTab, MatTabChangeEvent, MatTabGroup, MatTabsModule
} from '@angular/material/tabs';
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
import { buildXlsxFile } from '../../../../utils/xlsx-file.utils';
import { LanguageService } from '../../../../services/language.service';

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
  let mockLanguageService: { active: { code: string } };

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
    mockLanguageService = { active: { code: 'de' } };

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
        { provide: LanguageService, useValue: mockLanguageService },
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
    expect(component.unitRows.data.length).toBe(1);
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

  // Material builds the content of both tabs up front, a table and a sorter each. The item table hung on
  // the sorter of the unit tab, and a switch of tabs built new rows without the filter in the field (#2184).
  it('should keep the sorting and the filter of the item tab when the tabs are switched (#2184)', fakeAsync(() => {
    const item = (id: string, description: string): ItemsMetadataValues => ({ id, variableId: 'v', description });
    component.data = {
      units: [
        { id: 1, key: 'K1', metadata: { items: [item('I1', 'Notiz'), item('I2', 'Notiz')] } },
        { id: 2, key: 'K2', metadata: { items: [item('I3', '')] } }
      ],
      warning: ''
    };
    component.ngOnInit();
    const openTab = (index: number) => {
      fixture.debugElement.query(By.directive(MatTabGroup)).componentInstance.selectedIndex = index;
      // what the tab group's selectedTabChange calls; the test environment does not send it
      component.tabChanged({ index, tab: null as unknown as MatTab } as MatTabChangeEvent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    };
    const itemTab = () => fixture.nativeElement.querySelectorAll('mat-tab-body')[1] as HTMLElement;
    const shownIds = () => Array.from(itemTab().querySelectorAll('tr.mat-mdc-row td:nth-child(2)'))
      .map(cell => cell.textContent?.trim());
    fixture.detectChanges();

    openTab(1);
    const idHeader = Array.from(itemTab().querySelectorAll('th'))
      .find(header => header.textContent?.trim() === 'metadata.id') as HTMLElement;
    idHeader.click(); // ascending
    idHeader.click(); // descending
    const filter = itemTab().querySelector('input') as HTMLInputElement;
    filter.value = 'notiz';
    filter.dispatchEvent(new KeyboardEvent('keyup'));
    fixture.detectChanges();
    openTab(0);
    openTab(1);

    expect(shownIds()).toEqual(['I2', 'I1']);
  }));

  // A cell belongs to its field by id; the column shows the field's name in the language of the interface.
  // Keyed by name, a value stored under another name than the profile's landed in no column (#2207).
  it('keys cell values by field id and names the column in the language of the interface', () => {
    const label = [{ lang: 'de', value: 'Aufgabenzeit' }, { lang: 'en', value: 'Task time' }];
    mockMetadataService.unitProfileColumns = [{
      label,
      entries: [{
        id: 'e1', label, type: 'TEXT', parameters: null
      }]
    }] as unknown as MDProfileGroup[];
    const unit = {
      id: 1,
      key: 'K1',
      metadata: {
        profiles: [{
          order: 0,
          entries: [{
            id: 'e1', label: [{ lang: 'de', value: 'Zeit (alt)' }], value: '42', valueAsText: { value: '42' }
          }]
        }]
      }
    } as unknown as UnitPropertiesDto;
    mockLanguageService.active.code = 'en';
    const english = TestBed.createComponent(TableViewComponent).componentInstance;

    english.data = { units: [unit], warning: '' };
    english.ngOnInit();

    expect(english.unitColumns).toEqual(['key', 'e1']);
    expect(english.fieldNames).toEqual({ e1: 'Task time' });
    expect(english.unitRows.data[0]).toMatchObject({ e1: '42' });
  });

  it('shows every term of a field once, in the language of the interface (#2207)', () => {
    const entries = [{
      id: 'data',
      label: [],
      value: [{ id: 'dt/1' }, { id: 'dt/3' }],
      valueAsText: [
        { lang: 'de', value: 'Kompetenzdaten' }, { lang: 'en', value: 'Skills data' },
        { lang: 'de', value: 'Umfragedaten' }, { lang: 'en', value: 'Survey data' }
      ]
    }] as unknown as MetadataValuesEntry[];
    mockLanguageService.active.code = 'en';
    const english = TestBed.createComponent(TableViewComponent).componentInstance;

    english.data = { units: [{ id: 1, key: 'K1', metadata: { profiles: [{ order: 0, entries }] } }], warning: '' };
    english.ngOnInit();

    expect(english.unitRows.data[0]).toMatchObject({ data: 'Skills data<br>Survey data' });
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

      component.ngOnInit();

      expect(component.itemRows.data).toEqual([
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

      component.ngOnInit();

      expect(component.unitRows.data).toEqual([{ key: link(1, 'K1'), Themen: 'Zahlen<br>Raum', Stufe: 'II' }]);
    });

    // The unit cell holds its link as HTML, and the filter searched it: every unit had "a" in "#/a/" (#2195).
    it('should filter by what the table shows, not by the address of the unit link (#2195)', () => {
      component.data = {
        units: [{ id: 1, key: 'A1' }, { id: 2, key: 'B1' }],
        warning: ''
      };
      component.ngOnInit();

      component.applyFilter('units', { target: { value: 'a' } } as unknown as Event);

      expect(component.unitRows.filteredData.map(row => row.key)).toEqual([link(1, 'A1')]);
    });

    const sortedBy = (rows: MatTableDataSource<ColumnValues>, column: string): ColumnValues[] => rows.sortData(
      [...rows.data],
      { active: column, direction: 'asc' } as MatSort
    );

    it('should sort the units by their key, not by the address of their link (#1872)', () => {
      // loaded in the order of the keys; sorted by the link, unit 100 came first and 9 last
      component.data = {
        units: [{ id: 100, key: 'Aa' }, { id: 9, key: 'ab' }, { id: 12, key: 'Zz' }],
        warning: ''
      };
      component.ngOnInit();
      component.unitRows.data.reverse();

      expect(sortedBy(component.unitRows, 'key').map(row => row.key))
        .toEqual([link(100, 'Aa'), link(9, 'ab'), link(12, 'Zz')]);
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
      component.ngOnInit();

      expect(sortedBy(component.itemRows, field).map(row => row[field])).toEqual(['0.25', '0.5']);
      expect(sortedBy(component.itemRows, 'id').map(row => row.id)).toEqual(['1.9', '1.10']);
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
      component.ngOnInit();
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
      component.ngOnInit();
      component.unitRows.filter = 'raum';
      component.unitRows.sort = TestBed.runInInjectionContext(() => new MatSort());
      component.unitRows.sort.active = 'key';
      component.unitRows.sort.direction = 'desc';

      await component.downloadMetadata();

      expect(jest.mocked(buildXlsxFile).mock.lastCall?.[2]).toEqual([
        { key: 'K2', Themen: 'Raum' },
        { key: 'K1', Themen: 'Zahlen\nRaum' }
      ]);
    });
  });
});

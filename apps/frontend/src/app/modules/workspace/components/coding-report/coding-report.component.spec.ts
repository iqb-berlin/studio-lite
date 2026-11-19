import { CodingReportDto } from '@studio-lite-lib/api-dto';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Observable, throwError } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { CodingReportComponent } from './coding-report.component';
import { TextSortTableDataSource } from '../../../../models/text-sort-table-data-source.class';

describe('CodingReportComponent', () => {
  let component: CodingReportComponent;
  let fixture: ComponentFixture<CodingReportComponent>;

  let backendService: {
    getCodingReport: jest.Mock<Observable<CodingReportDto[]>, [number]>;
  };
  let workspaceService: { selectedWorkspaceId: number };

  // The report sends codes; the component shows their texts (#2180)
  const rows: CodingReportDto[] = [
    {
      unit: 'U1',
      unitKey: 'U1',
      variable: 'V1',
      variableType: 'BASE',
      item: 'I1',
      validation: 'OK',
      validationProblems: [],
      codingType: 'NO_RULES',
      trainingEffort: 'NORMAL'
    },
    {
      unit: 'U1',
      unitKey: 'U1',
      variable: 'V2',
      variableType: 'DERIVED',
      item: 'I2',
      validation: 'ERROR',
      validationProblems: [
        {
          type: 'INVALID_SOURCE', breaking: true
        },
        {
          type: 'RULE_PARAMETER_INVALID', breaking: false, code: '17'
        }
      ],
      codingType: 'SEMI_AUTOMATIC',
      trainingEffort: 'INCREASED'
    },
    {
      unit: 'U1',
      unitKey: 'U1',
      variable: 'V3',
      variableType: 'DERIVED',
      item: 'I3',
      validation: 'WARNING',
      validationProblems: [{
        type: 'ONLY_ONE_SOURCE', breaking: false
      }],
      codingType: 'AUTOMATIC',
      trainingEffort: 'NORMAL'
    },
    {
      unit: 'U2',
      unitKey: 'U2',
      variable: '',
      variableType: '',
      item: '',
      validation: 'SCHEME_MISSING_OR_TOO_OLD',
      validationProblems: [],
      codingType: '',
      trainingEffort: ''
    }
  ];

  beforeEach(async () => {
    backendService = {
      getCodingReport: jest.fn<
        Observable<CodingReportDto[]>,
        [number]
      >(() => of(rows))
    };
    workspaceService = {
      selectedWorkspaceId: 10
    };

    await TestBed.configureTestingModule({
      imports: [
        CodingReportComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { units: [] } },
        { provide: WorkspaceBackendService, useValue: backendService },
        { provide: WorkspaceService, useValue: workspaceService }
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.setTranslation('de', {
      workspace: { 'coding-report': 'Kodierbericht' },
      'coding-report': {
        unit: 'Aufgabe',
        variable: 'Variable',
        variableType: 'Variablentyp',
        item: 'Item',
        validation: 'Validierung',
        validationDetails: 'Validierung',
        codingType: 'Kodiertyp',
        trainingEffort: 'Schulungsaufwand',
        'csv-validation-details': 'Validierungsdetails',
        'code-reference': 'Code: {{code}}',
        'validation-problems': {
          INVALID_SOURCE: 'Ungültige Quelle',
          RULE_PARAMETER_INVALID: 'Ungültiger Regelparameter',
          ONLY_ONE_SOURCE: 'Nur eine Quelle'
        },
        'problem-count-one': '1 Problem',
        'problem-count-many': '{{count}} Probleme',
        'no-problems': 'Keine Probleme',
        empty: 'Keine Einträge im Kodierbericht vorhanden.',
        'no-matches': 'Keine Einträge entsprechen den aktuellen Anzeigeeinstellungen.',
        'load-error': 'Der Kodierbericht konnte nicht geladen werden.',
        retry: 'Erneut laden',
        severity: {
          error: 'Fehler',
          warning: 'Warnung'
        },
        'technical-type': 'Technischer Typ: {{type}}',
        'validation-status': {
          OK: 'OK',
          WARNING: 'Warnung',
          ERROR: 'Fehler',
          SCHEME_MISSING_OR_TOO_OLD: 'Kodierschema mit Schemer Version ab 1.5 erzeugen!',
          SCHEME_UNREADABLE: 'Kodierschema kann nicht ausgewertet werden'
        },
        'variable-type': { BASE: 'Basisvariable', DERIVED: 'abgeleitete Variable' },
        'coding-type': {
          AUTOMATIC: 'automatisch', MANUAL: 'manuell', SEMI_AUTOMATIC: 'halbautomatisch', NO_RULES: 'keine Regeln'
        },
        'training-effort': { INCREASED: 'erhöht', NORMAL: 'normal' }
      }
    });
    translateService.use('de');

    fixture = TestBed.createComponent(CodingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads coding report and filters coded variables by default', () => {
    expect(backendService.getCodingReport).toHaveBeenCalledWith(10);
    expect(component.unitDataRows[0].validationDetails).toBe('');
    expect(component.unitDataRows[1].validationDetails)
      .toBe(
        'Ungültige Quelle (INVALID_SOURCE) | ' +
        'Ungültiger Regelparameter (RULE_PARAMETER_INVALID) [Code: 17]'
      );
    expect(component.dataSource.data).toEqual([
      component.unitDataRows[1],
      component.unitDataRows[2],
      component.unitDataRows[3]
    ]);
  });

  it('shows the codes of the report as texts of the interface (#2180)', () => {
    const cellsOfV2 = Array.from(
      fixture.nativeElement.querySelectorAll('.coding-report-row')[0]
        .querySelectorAll('td') as NodeListOf<HTMLElement>
    ).map(cell => cell.textContent?.trim());

    expect(cellsOfV2).toEqual(expect.arrayContaining(['V2', 'abgeleitete Variable', 'halbautomatisch', 'erhöht']));
  });

  it('filters by the texts shown, not by the codes (#2180)', () => {
    const input = document.createElement('input');
    input.value = 'halbautomatisch';

    component.applyFilter({ target: input } as unknown as Event);

    expect(component.dataSource.filteredData.map(row => row.variable)).toEqual(['V2']);
  });

  it('shows a compact validation summary and expands structured details', () => {
    fixture.detectChanges();

    const summaryButton = fixture.nativeElement.querySelector(
      '[data-cy="validation-summary"]'
    ) as HTMLButtonElement;
    expect(summaryButton.textContent).toContain('2 Probleme');
    expect(summaryButton.textContent).toContain('Fehler');
    expect(summaryButton.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.validation-details-panel')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.validation-problem__technical-type')
    ).toBeNull();

    summaryButton.click();
    fixture.detectChanges();

    expect(summaryButton.getAttribute('aria-expanded')).toBe('true');
    const detailsPanel = fixture.nativeElement.querySelector(
      '.validation-details-panel'
    ) as HTMLElement;
    expect(detailsPanel).not.toBeNull();

    const problemLabels = Array.from(
      fixture.nativeElement.querySelectorAll(
        '.validation-problem__label'
      ) as NodeListOf<HTMLElement>
    ).map(element => element.textContent?.trim());
    expect(problemLabels).toEqual([
      'Ungültige Quelle',
      'Ungültiger Regelparameter'
    ]);
    expect(detailsPanel.textContent).toContain('Code: 17');
    expect(detailsPanel.textContent).not.toContain('RULE_PARAMETER_INVALID');
    expect(
      detailsPanel.querySelector('.validation-problem__technical-type')
        ?.getAttribute('aria-label')
    ).toBe('Technischer Typ: INVALID_SOURCE');
  });

  it('removes validation details from the DOM when collapsed', () => {
    const summaryButton = fixture.nativeElement.querySelector(
      '[data-cy="validation-summary"]'
    ) as HTMLButtonElement;

    summaryButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.validation-details-panel')).not.toBeNull();

    summaryButton.click();
    fixture.detectChanges();
    expect(summaryButton.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.validation-details-panel')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.validation-problem__technical-type')
    ).toBeNull();
  });

  it('shows the singular count and warning severity', () => {
    const summaryButtons = Array.from(
      fixture.nativeElement.querySelectorAll(
        '[data-cy="validation-summary"]'
      ) as NodeListOf<HTMLButtonElement>
    );
    const warningButton = summaryButtons.find(
      button => button.textContent?.includes('1 Problem')
    );

    expect(warningButton).toBeDefined();
    expect(warningButton?.textContent).toContain('Warnung');
  });

  it('shows rows without validation problems unobtrusively', () => {
    component.toggleChange();
    fixture.detectChanges();

    const okState = fixture.nativeElement.querySelector(
      '.validation-summary--ok'
    ) as HTMLElement;
    expect(okState.textContent).toContain('Keine Probleme');
  });

  it('shows an explicit empty state for an empty report', () => {
    backendService.getCodingReport.mockReturnValueOnce(of([]));

    component.loadCodingReport();
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector(
      '[data-cy="coding-report-empty"]'
    ) as HTMLElement;
    expect(emptyState.textContent).toContain(
      'Keine Einträge im Kodierbericht vorhanden.'
    );
    expect(component.loadError).toBe(false);
  });

  it('shows a distinct state when the text filter has no matches', () => {
    const input = document.createElement('input');
    input.value = 'does-not-exist';

    component.applyFilter({ target: input } as unknown as Event);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector(
      '[data-cy="coding-report-empty"]'
    ) as HTMLElement;
    expect(emptyState.textContent).toContain(
      'Keine Einträge entsprechen den aktuellen Anzeigeeinstellungen.'
    );
    expect(emptyState.textContent).not.toContain(
      'Keine Einträge im Kodierbericht vorhanden.'
    );
  });

  it('shows the filtered state when only uncoded variables exist', () => {
    backendService.getCodingReport.mockReturnValueOnce(of([rows[0]]));

    component.loadCodingReport();
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector(
      '[data-cy="coding-report-empty"]'
    ) as HTMLElement;
    expect(component.unitDataRows).toHaveLength(1);
    expect(component.dataSource.data).toHaveLength(0);
    expect(emptyState.textContent).toContain(
      'Keine Einträge entsprechen den aktuellen Anzeigeeinstellungen.'
    );
  });

  it('shows a load error and retries successfully', () => {
    backendService.getCodingReport.mockReturnValueOnce(
      throwError(() => new Error('Request failed'))
    );

    component.loadCodingReport();
    fixture.detectChanges();

    const errorState = fixture.nativeElement.querySelector(
      '[data-cy="coding-report-error"]'
    ) as HTMLElement;
    expect(errorState.textContent).toContain(
      'Der Kodierbericht konnte nicht geladen werden.'
    );
    expect(component.loadError).toBe(true);
    expect(component.isLoading).toBe(false);

    backendService.getCodingReport.mockReturnValueOnce(of(rows));
    const retryButton = fixture.nativeElement.querySelector(
      '[data-cy="coding-report-retry"]'
    ) as HTMLButtonElement;
    retryButton.click();
    fixture.detectChanges();

    expect(component.loadError).toBe(false);
    expect(fixture.nativeElement.querySelector(
      '[data-cy="coding-report-error"]'
    )).toBeNull();
    expect(component.dataSource.data).toHaveLength(3);
  });

  it('shows unstructured validation errors instead of marking them as valid', () => {
    const errorState = fixture.nativeElement.querySelector(
      '.validation-summary--error'
    ) as HTMLElement;

    expect(errorState.textContent).toContain(
      'Kodierschema mit Schemer Version ab 1.5 erzeugen!'
    );
    expect(component.unitDataRows[3].validationSeverity).toBe('error');
    expect(component.unitDataRows[3].unstructuredValidationMessage).toBe(
      'Kodierschema mit Schemer Version ab 1.5 erzeugen!'
    );
  });

  it('toggleChange includes all rows', () => {
    component.toggleChange();

    expect(component.codedVariablesOnly).toBe(false);
    expect(component.dataSource.data).toEqual(component.unitDataRows);
  });

  it('applyFilter updates the table filter', () => {
    component.dataSource = new TextSortTableDataSource(component.unitDataRows);

    const input = document.createElement('input');
    input.value = 'v2';

    const event = { target: input } as unknown as Event;
    component.applyFilter(event);

    expect(component.dataSource.filter).toBe('v2');
  });

  it('sorts validation by severity', () => {
    component.toggleChange();

    const sortedRows = component.dataSource.sortData(
      [...component.dataSource.data],
      {
        active: 'validationDetails',
        direction: 'asc'
      } as MatSort
    );

    expect(sortedRows.map(row => row.validationSeverity)).toEqual([
      'error',
      'error',
      'warning',
      'ok'
    ]);
  });

  it('sorts the other columns by their values', () => {
    component.toggleChange();

    const sortedRows = component.dataSource.sortData(
      [...component.dataSource.data],
      {
        active: 'variable',
        direction: 'desc'
      } as MatSort
    );

    expect(sortedRows.map(row => row.variable)).toEqual(['V3', 'V2', 'V1', '']);
  });

  it('sorts the units by their key, not by the address of their link (#1872)', () => {
    // loaded in the order of the keys; sorted by the link, unit 100 came first and 9 last
    backendService.getCodingReport.mockReturnValue(of([
      { ...rows[1], unit: '<a href=#/a/10/100>Aa: eins</a>', unitKey: 'Aa' },
      { ...rows[1], unit: '<a href=#/a/10/9>ab: zwei</a>', unitKey: 'ab' },
      { ...rows[1], unit: '<a href=#/a/10/12>Zz: drei</a>', unitKey: 'Zz' }
    ]));
    component.loadCodingReport();

    const sortedRows = component.dataSource.sortData(
      [...component.dataSource.data],
      {
        active: 'unit',
        direction: 'desc'
      } as MatSort
    );

    expect(sortedRows.map(row => row.unitKey)).toEqual(['Zz', 'ab', 'Aa']);
  });

  it('downloadCodingReport creates and revokes object URL', () => {
    const blobParts: BlobPart[][] = [];
    const OriginalBlob = globalThis.Blob;
    const blobMock = jest.fn((parts: BlobPart[] = [], options?: BlobPropertyBag) => {
      blobParts.push(parts);
      return new OriginalBlob(parts, options);
    });
    Object.defineProperty(globalThis, 'Blob', {
      value: blobMock,
      writable: true
    });
    const createObjectURLMock = jest.fn((blob: Blob) => {
      expect(blob).toBeInstanceOf(OriginalBlob);
      return 'blob:test-url';
    });
    const revokeObjectURLMock = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURLMock,
      writable: true
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURLMock,
      writable: true
    });
    const clickMock = jest.fn();
    const link = {
      href: '',
      download: '',
      click: clickMock
    } as unknown as HTMLAnchorElement;
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(link);

    component.downloadCodingReport();

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');
    expect(String(blobParts[0][0])).toContain(
      'Aufgabe;Variable;Variablentyp;Item;Validierung;Validierungsdetails;Kodiertyp;Schulungsaufwand'
    );
    expect(String(blobParts[0][0])).toContain('"V2";"abgeleitete Variable";"I2";"Fehler";');
    expect(String(blobParts[0][0])).toContain('"halbautomatisch";"erhöht"');
    expect(link.download).toBe('Kodierbericht.csv');
    expect(String(blobParts[0][0])).toContain(
      '"Ungültige Quelle (INVALID_SOURCE) | ' +
      'Ungültiger Regelparameter (RULE_PARAMETER_INVALID) [Code: 17]"'
    );

    Object.defineProperty(globalThis, 'Blob', {
      value: OriginalBlob,
      writable: true
    });
    createElementSpy.mockRestore();
  });
});

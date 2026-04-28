import { CodingReportDto } from '@studio-lite-lib/api-dto';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, Observable } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { CodingReportComponent } from './coding-report.component';

describe('CodingReportComponent', () => {
  let component: CodingReportComponent;
  let fixture: ComponentFixture<CodingReportComponent>;

  let backendService: {
    getCodingReport: jest.Mock<Observable<CodingReportDto[]>, [number]>;
  };
  let workspaceService: { selectedWorkspaceId: number };

  const rows: CodingReportDto[] = [
    {
      unit: 'U1',
      variable: 'V1',
      item: 'I1',
      validation: 'ok',
      codingType: 'keine Regeln',
      trainingEffort: 'normal'
    } as CodingReportDto,
    {
      unit: 'U1',
      variable: 'V2',
      item: 'I2',
      validation: 'ok',
      codingType: 'REGEL',
      trainingEffort: 'erhöht'
    } as CodingReportDto
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

    fixture = TestBed.createComponent(CodingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads coding report and filters coded variables by default', () => {
    expect(backendService.getCodingReport).toHaveBeenCalledWith(10);
    expect(component.unitDataRows).toEqual(rows);
    expect(component.dataSource.data).toEqual([rows[1]]);
  });

  it('toggleChange includes all rows', () => {
    component.toggleChange();

    expect(component.codedVariablesOnly).toBe(false);
    expect(component.dataSource.data).toEqual(rows);
  });

  it('applyFilter updates the table filter', () => {
    component.dataSource = new MatTableDataSource(rows);

    const input = document.createElement('input');
    input.value = 'v2';

    const event = { target: input } as unknown as Event;
    component.applyFilter(event);

    expect(component.dataSource.filter).toBe('v2');
  });

  it('downloadCodingReport creates and revokes object URL', () => {
    const createObjectURLMock = jest.fn(() => 'blob:test-url');
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
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickMock
    } as unknown as HTMLAnchorElement);

    component.downloadCodingReport();

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');

    createElementSpy.mockRestore();
  });
});

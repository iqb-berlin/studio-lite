import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { UnitInViewDto } from '@studio-lite-lib/api-dto';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { saveAs } from 'file-saver-es';
import { BackendService } from '../../services/backend.service';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { I18nService } from '../../../../services/i18n.service';
import { AppService } from '../../../../services/app.service';
import { UnitsMenuComponent } from '../units-menu/units-menu.component';

@Component({
  selector: 'studio-lite-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, FormsModule, TranslateModule, SearchFilterComponent, RouterLink, DatePipe, MatPaginator, UnitsMenuComponent]
})

export class UnitsComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<UnitInViewDto>([]);
  displayedColumns: string[] = [
    'id',
    'key',
    'name',
    'workspaceId',
    'lastChangedDefinition',
    'lastChangedDefinitionUser',
    'lastChangedMetadata',
    'lastChangedMetadataUser',
    'lastChangedScheme',
    'lastChangedSchemeUser'
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private backendService: BackendService,
              private appService: AppService,
              public i18nService: I18nService) {
  }

  ngOnInit(): void {
    setTimeout(() => this.getAllUnits());
  }

  private getAllUnits(): void {
    this.appService.dataLoading = true;
    this.backendService.getAllUnits()
      .subscribe(units => {
        if (Array.isArray(units)) {
          this.dataSource.data = units;
        }
        this.appService.dataLoading = false;
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private static cleanUnitsData(units: UnitInViewDto[]): UnitInViewDto[] {
    return units.map(unit => ({
      key: unit.key,
      name: unit.name,
      groupName: unit.groupName,
      id: unit.id,
      workspaceName: unit.workspaceName,
      workspaceId: unit.workspaceId,
      lastChangedDefinition: unit.lastChangedDefinition,
      lastChangedMetadata: unit.lastChangedMetadata,
      lastChangedScheme: unit.lastChangedScheme,
      lastChangedDefinitionUser: unit.lastChangedDefinitionUser,
      lastChangedMetadataUser: unit.lastChangedMetadataUser,
      lastChangedSchemeUser: unit.lastChangedSchemeUser
    }));
  }

  private static toCSV(units: UnitInViewDto[]): string {
    const replacer = (key: string, value: unknown) => (value === null ? '' : value);
    const header = Object.keys(units[0]);
    return [
      header.join(','), // header row first
      ...units.map(row => header
        .map(fieldName => JSON.stringify(row[fieldName as keyof UnitInViewDto], replacer))
        .join(','))
    ].join('\r\n');
  }

  private saveFile(csv: string): void {
    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
    const datePipe = new DatePipe(this.i18nService.fullLocale);
    const thisDate = datePipe.transform(new Date(), this.i18nService.fileDateFormat);
    saveAs(blob, `${thisDate} Units.csv`);
  }

  downloadUnits(): void {
    this.appService.dataLoading = true;
    try {
      this.backendService.getAllUnits()
        .subscribe(units => {
          if (Array.isArray(units)) {
            const items = UnitsComponent.cleanUnitsData(units as UnitInViewDto[]);
            const csv = UnitsComponent.toCSV(items);
            this.saveFile(csv);
          }
          this.appService.dataLoading = false;
        });
    } catch (e) {
      this.appService.dataLoading = false;
    }
  }
}

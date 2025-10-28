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
import { BackendService } from '../../services/backend.service';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { I18nService } from '../../../../services/i18n.service';
import { AppService } from '../../../../services/app.service';

@Component({
  selector: 'studio-lite-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, FormsModule, TranslateModule, SearchFilterComponent, RouterLink, DatePipe, MatPaginator]
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
}

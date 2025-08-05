import {
  AfterViewInit, Component, OnInit, ViewChild
} from '@angular/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { UnitByDefinitionIdDto } from '@studio-lite-lib/api-dto';
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
import { BackendService } from '../../services/backend.service';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';

@Component({
  selector: 'studio-lite-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, FormsModule, TranslateModule, SearchFilterComponent, RouterLink, DatePipe]
})

export class UnitsComponent implements OnInit, AfterViewInit {
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  dataSource = new MatTableDataSource<UnitByDefinitionIdDto>([]);
  displayedColumns: string[] = [
    'id',
    'key',
    'name',
    'workspaceId',
    'definitionId',
    'lastChangedDefinition',
    'lastChangedDefinitionUser',
    'lastChangedMetadata',
    'lastChangedMetadataUser',
    'lastChangedScheme',
    'lastChangedSchemeUser'
  ];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private backendService: BackendService) {
  }

  ngOnInit(): void {
    this.backendService.getAllUnits()
      .subscribe(units => {
        if (Array.isArray(units)) {
          this.dataSource.data = units;
        }
      });
  }



  // select: {
  //   definitionId: true,
  //   key: true,
  //   name: true,
  //   groupName: true,
  //   id: true,
  //   workspaceId: true,
  //   lastChangedDefinition: true,
  //   lastChangedDefinitionUser: true,
  //   lastChangedMetadata: true,
  //   lastChangedMetadataUser: true,
  //   lastChangedScheme: true,
  //   lastChangedSchemeUser: true,
  //   metadata: false,
  //   variables: false
  // }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }
}

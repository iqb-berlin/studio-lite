import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from '../../services/backend.service';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { I18nService } from '../../../../services/i18n.service';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { DeleteDialogComponent } from '../../../shared/components/delete-dialog/delete-dialog.component';
import { AppService } from '../../../../services/app.service';

@Component({
  selector: 'studio-lite-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, FormsModule, TranslateModule, SearchFilterComponent, RouterLink, DatePipe, MatPaginator, MatTooltip, MatIcon, MatIconButton]
})

export class UnitsComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  dataSource = new MatTableDataSource<UnitInViewDto>([]);
  displayedColumns: string[] = [
    'id',
    'key',
    'name',
    'workspaceId',
    'workspaceName',
    'lastChangedDefinition',
    'lastChangedDefinitionUser',
    'lastChangedMetadata',
    'lastChangedMetadataUser',
    'lastChangedScheme',
    'lastChangedSchemeUser',
    'delete'
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private backendService: BackendService,
              private wsgAdminService: WsgAdminService,
              public i18nService: I18nService,
              private translateService: TranslateService,
              private snackBar: MatSnackBar,
              private appService: AppService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    setTimeout(() => this.updateUnits());
  }

  private updateUnits(): void {
    this.appService.dataLoading = true;
    this.backendService
      .getAllUnitsForGroup(this.wsgAdminService.selectedWorkspaceGroupId.value)
      .subscribe(units => {
        this.appService.dataLoading = false;
        if (Array.isArray(units)) {
          this.dataSource.data = units;
        }
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private delete(workspaceId: number, unitId: number) {
    this.backendService.deleteWorkspaceUnit(workspaceId, unitId)
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        isOk => {
          if (isOk) {
            this.updateUnits();
            this.snackBar.open(
              this.translateService.instant('wsg-admin.unit-deleted'),
              '',
              { duration: 3000 }
            );
          } else {
            this.snackBar.open(
              this.translateService.instant('wsg-admin.unit-not-deleted'),
              this.translateService.instant('error'),
              { duration: 3000 }
            );
          }
        }
      );
  }

  openDeleteDialog(unit: UnitInViewDto): void {
    this.dialog
      .open(DeleteDialogComponent, {
        width: '400px',
        data: {
          title: this.translateService.instant('wsg-admin.delete-unit'),
          content: this.translateService
            .instant('wsg-admin.delete-unit-question',
              { unitKey: unit.key })
        }
      })
      .afterClosed()
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((result: boolean) => {
        if (result) this.delete(unit.workspaceId, unit.id);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

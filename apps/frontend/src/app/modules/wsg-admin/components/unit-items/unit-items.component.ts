import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { UnitItemInViewDto } from '@studio-lite-lib/api-dto';
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
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { BackendService } from '../../services/backend.service';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { I18nService } from '../../../../services/i18n.service';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { AppService } from '../../../../services/app.service';
import { IncludePipe } from '../../../../pipes/include.pipe';
import { DeleteDialogComponent } from '../../../../components/delete-dialog/delete-dialog.component';

@Component({
  selector: 'studio-lite-unit-items',
  templateUrl: './unit-items.component.html',
  styleUrls: ['./unit-items.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, FormsModule, TranslateModule, SearchFilterComponent, RouterLink, DatePipe, MatPaginator, IncludePipe, MatIcon, MatIconButton, MatTooltip]
})

export class UnitItemsComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  dataSource = new MatTableDataSource<UnitItemInViewDto>([]);
  displayedColumns: string[] = [
    'id',
    'uuid',
    'variableId',
    'variableReadOnlyId',
    'weighting',
    'description',
    'unitId',
    'unitKey',
    'unitName',
    'workspaceId',
    'workspaceName',
    'changedAt',
    'createdAt',
    'delete'
  ];

  restrictedColumns = ['id', 'unitId', 'workspaceId', 'delete'];

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
    setTimeout(() => this.updateUnitItems());
  }

  private updateUnitItems(): void {
    this.appService.dataLoading = true;
    this.backendService
      .getAllUnitItemsForGroup(this.wsgAdminService.selectedWorkspaceGroupId.value)
      .subscribe(items => {
        this.appService.dataLoading = false;
        if (Array.isArray(items)) {
          this.dataSource.data = items;
        }
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private delete(item: UnitItemInViewDto) {
    if (item.workspaceId !== undefined && item.unitId !== undefined && item.uuid) {
      this.backendService.deleteUnitItem(item.workspaceId, item.unitId, item.uuid!)
        .pipe(
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(
          isOk => {
            if (isOk) {
              this.updateUnitItems();
              this.snackBar.open(
                this.translateService.instant('wsg-admin.unit-item-deleted'),
                '',
                { duration: 3000 }
              );
            } else {
              this.snackBar.open(
                this.translateService.instant('wsg-admin.unit-item-not-deleted'),
                this.translateService.instant('error'),
                { duration: 3000 }
              );
            }
          }
        );
    }
  }

  openDeleteDialog(item: UnitItemInViewDto): void {
    this.dialog
      .open(DeleteDialogComponent, {
        width: '400px',
        data: {
          title: this.translateService.instant('wsg-admin.delete-unit-item'),
          content: this.translateService
            .instant('wsg-admin.delete-unit-item-question',
              { uuid: item.uuid })
        }
      })
      .afterClosed()
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((result: boolean) => {
        if (result) this.delete(item);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  formatUuid(uuid: string): string {
    return `${uuid.substring(0, 3)}...${uuid.substring(uuid.length - 3)}`;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

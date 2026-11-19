import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { saveAs } from 'file-saver-es';
import {
  catchError, of, Subject, switchMap, takeUntil
} from 'rxjs';
import { WorkspaceFullDto } from '@studio-lite-lib/api-dto';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { BackendService } from '../../services/backend.service';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { AppService } from '../../../../services/app.service';
import { WorkspacesMenuComponent } from '../workspaces-menu/workspaces-menu.component';
import { I18nService } from '../../../../services/i18n.service';
import { TextSortTableDataSource } from '../../../../models/text-sort-table-data-source.class';
import { buildWorkspaceReportFile } from '../../../../utils/workspace-report.utils';

@Component({
  selector: 'studio-lite-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],

  imports: [
    MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatSortHeader,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, FormsModule, TranslateModule, SearchFilterComponent, RouterLink,
    MatPaginator, WorkspacesMenuComponent, MatIcon, MatTooltip
  ]
})

export class WorkspacesComponent implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new TextSortTableDataSource<WorkspaceFullDto>([]);
  displayedColumns: string[] = ['id', 'name', 'groupId', 'editor', 'preview', 'schemer', 'comments', 'notes'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private backendService: BackendService,
    private appService: AppService,
    private translateService: TranslateService,
    private i18nService: I18nService
  ) {
  }

  ngOnInit(): void {
    setTimeout(() => this.getAllWorkspaces());
  }

  private getAllWorkspaces(): void {
    this.appService.dataLoading = true;
    this.backendService.getAllWorkspaces()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(workspaces => {
        if (Array.isArray(workspaces)) {
          this.dataSource.data = workspaces;
        }
        this.appService.dataLoading = false;
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // The API sends the figures; the file is built here, in the language of the interface (#2181).
  xlsxDownloadWorkspaceReport(): void {
    this.appService.dataLoading = true;
    this.backendService.getWorkspaceReport()
      .pipe(
        switchMap(report => (report ? buildWorkspaceReportFile(
          report,
          key => this.translateService.instant(key),
          this.i18nService.dateFormat
        ) : of(null))),
        catchError(() => of(null)),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(file => {
        if (file) {
          const datePipe = new DatePipe(this.i18nService.fullLocale);
          const thisDate = datePipe.transform(new Date(), this.i18nService.fileDateFormat);
          saveAs(file, `${thisDate} ${this.translateService.instant('wsg-admin.report-workspaces')}.xlsx`);
        }
        this.appService.dataLoading = false;
      });
  }

  // eslint-disable-next-line class-methods-use-this
  isRouteHidden(workspace: WorkspaceFullDto, route: string): boolean {
    if (!workspace.settings || !workspace.settings.hiddenRoutes) {
      return false; // Routes are visible by default
    }
    return workspace.settings.hiddenRoutes.includes(route);
  }
}

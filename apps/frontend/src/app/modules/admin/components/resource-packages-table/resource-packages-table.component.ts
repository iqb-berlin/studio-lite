import {
  Component, Inject, Input, OnChanges, OnDestroy, output, signal, SimpleChanges, ViewChild
} from '@angular/core';
import {
  MatTableDataSource, MatTable, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatColumnDef, MatHeaderCellDef,
  MatHeaderCell, MatCellDef, MatCell
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SelectionModel } from '@angular/cdk/collections';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackageChoice } from '@studio-lite/shared-code';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { ResourcePackageServingPipe } from '../../pipes/resource-package-serving.pipe';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { I18nService } from '../../../../services/i18n.service';
import { IsSelectedPipe } from '../../../../pipes/is-selected.pipe';
import { SelectionScopeStatePipe } from '../../../../pipes/selection-scope-state.pipe';
import { deselectHidden, SelectionScope, toggleAllInScope } from '../../../../utils/selection-scope.utils';

@Component({
  selector: 'studio-lite-resource-packages-table',
  templateUrl: './resource-packages-table.component.html',
  styleUrls: ['./resource-packages-table.component.scss'],

  imports: [
    MatTable, MatSort, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatColumnDef, MatHeaderCellDef, MatHeaderCell,
    MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatSlideToggle, MatTooltip, MatIconButton, MatIcon, DatePipe,
    TranslateModule, SafeUrlPipe, SearchFilterComponent, IsSelectedPipe, SelectionScopeStatePipe,
    ResourcePackageServingPipe
  ]
})
export class ResourcePackagesTableComponent implements OnChanges, OnDestroy {
  resourcePackageProperties: string[] = ['name', 'packageName', 'default', 'createdAt'];
  displayedColumns: string[] = ['selectCheckbox', ...this.resourcePackageProperties];
  resourcePackagesPath!: string;
  // The selection lives here and not in the checkboxes of the rows shown: a package filtered out
  // stays selected and is ticked again when it is shown again (#433).
  readonly selection = new SelectionModel<ResourcePackageDto>(true, []);
  readonly selectionScope = signal<SelectionScope>('all');
  private ngUnsubscribe = new Subject<void>();

  @Input() dataSource!: MatTableDataSource<ResourcePackageDto>;
  @Input() selectedResourcePackages!: BehaviorSubject<number[]>;
  /** The default package per package name, to mark the package groups without a choice get (#1358). */
  @Input() defaults: ResourcePackageChoice = {};

  readonly setDefault = output<ResourcePackageDto>();
  readonly editPackageName = output<ResourcePackageDto>();

  @ViewChild(MatSort) sort!: MatSort;

  constructor(@Inject('SERVER_URL') public serverUrl: string,
              public i18nService: I18nService) {
    this.resourcePackagesPath = `${serverUrl}packages/`;
    this.selection.changed
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.selectedResourcePackages
        .next(this.selection.selected.map(resourcePackage => resourcePackage.id)));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const changeProperty = 'dataSource';
    if (changes[changeProperty]) {
      this.dataSource.sort = this.sort;
      // Reloaded after an upload or a deletion: the packages are new objects
      this.selection.clear();
    }
  }

  masterToggle(): void {
    toggleAllInScope(this.selection, this.dataSource, this.selectionScope());
  }

  deselectHidden(): void {
    deselectHidden(this.selection, this.dataSource);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

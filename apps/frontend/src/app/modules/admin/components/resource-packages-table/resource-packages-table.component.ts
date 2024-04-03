import {
  Component, Inject, Input, OnChanges, QueryList, SimpleChanges, ViewChild, ViewChildren
} from '@angular/core';
import {
  // eslint-disable-next-line max-len
  MatTableDataSource, MatTable, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'studio-lite-resource-packages-table',
  templateUrl: './resource-packages-table.component.html',
  styleUrls: ['./resource-packages-table.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatTable, MatSort, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, DatePipe, TranslateModule, SafeUrlPipe]
})
export class ResourcePackagesTableComponent implements OnChanges {
  resourcePackageProperties: string[] = ['name', 'createdAt'];
  displayedColumns: string[] = ['selectCheckbox', ...this.resourcePackageProperties];
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  resourcePackagesPath!: string;

  @Input() dataSource!: MatTableDataSource<ResourcePackageDto>;
  @Input() selectedResourcePackages!: BehaviorSubject<number[]>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChildren(MatCheckbox) checkBoxes!: QueryList<MatCheckbox>;

  constructor(@Inject('SERVER_URL') public serverUrl: string) {
    this.resourcePackagesPath = `${serverUrl}packages/`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const changeProperty = 'dataSource';
    if (changes[changeProperty]) {
      this.dataSource.sort = this.sort;
      setTimeout(() => this.updateSelectedResourcePackages());
    }
  }

  updateSelectedResourcePackages(): void {
    const checkedResources = this.checkBoxes.toArray()
      .filter((checkBox, index) => index > 0)
      .map(checkBox => checkBox.checked);
    this.selectedResourcePackages.next(
      this.dataSource.filteredData
        .map((resourcePackage: ResourcePackageDto) => resourcePackage.id)
        .filter((id: number, index: number) => checkedResources[index])
    );
  }

  toggleCheckBoxes(event: MatCheckboxChange): void {
    this.checkBoxes.forEach(checkBox => { checkBox.checked = event.checked; });
  }
}

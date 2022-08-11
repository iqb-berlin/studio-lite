import {
  Component, Input, OnChanges, QueryList, SimpleChanges, ViewChild, ViewChildren
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'studio-lite-resource-packages-table',
  templateUrl: './resource-packages-table.component.html',
  styleUrls: ['./resource-packages-table.component.scss']
})
export class ResourcePackagesTableComponent implements OnChanges {
  resourcePackageProperties: string[] = ['id', 'name', 'createdAt'];
  displayedColumns: string[] = ['selectCheckbox', ...this.resourcePackageProperties];
  @Input() dataSource!: MatTableDataSource<ResourcePackageDto>;
  @Input() selectedResourcePackages!: BehaviorSubject<number[]>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChildren(MatCheckbox) checkBoxes!: QueryList<MatCheckbox>

  ngOnChanges(changes: SimpleChanges): void {
    const changeProperty = 'dataSource';
    if (changes[changeProperty]) {
      this.dataSource.sort = this.sort;
    }
  }

  updateSelectedResourcePackages() {
    const checkedResources = this.checkBoxes.toArray()
      .filter((checkBox, index) => index > 0)
      .map(checkBox => checkBox.checked);
    this.selectedResourcePackages.next(
      this.dataSource.filteredData
        .map((resourcePackage: ResourcePackageDto) => resourcePackage.id)
        .filter((id: number, index: number) => checkedResources[index])
    );
  }

  toggleCheckBoxes(event: MatCheckboxChange) {
    this.checkBoxes.forEach(checkBox => { checkBox.checked = event.checked; });
    this.updateSelectedResourcePackages();
  }
}

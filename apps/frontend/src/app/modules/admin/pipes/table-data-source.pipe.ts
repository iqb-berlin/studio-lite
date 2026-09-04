import { Pipe, PipeTransform } from '@angular/core';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { MatTableDataSource } from '@angular/material/table';

/**
 * Wraps the resource packages in the data source a Material table needs, so the template can hand
 * an observable's value straight to the table instead of the component keeping one in a field.
 */
@Pipe({
  name: 'tableDataSource',
  standalone: true
})
export class TableDataSourcePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(resourcePackages: ResourcePackageDto[] | null): MatTableDataSource<ResourcePackageDto> {
    if (resourcePackages) {
      return new MatTableDataSource(resourcePackages);
    }
    return new MatTableDataSource();
  }
}

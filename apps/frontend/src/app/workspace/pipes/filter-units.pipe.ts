import { Pipe, PipeTransform } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { MatTableDataSource } from '@angular/material/table';

@Pipe({
  name: 'filterUnits'
})
export class FilterUnitsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(units: UnitInListDto[], filter: string): MatTableDataSource<UnitInListDto> {
    const source = new MatTableDataSource(units);
    source.filter = filter.trim().toLowerCase();
    return source;
  }
}

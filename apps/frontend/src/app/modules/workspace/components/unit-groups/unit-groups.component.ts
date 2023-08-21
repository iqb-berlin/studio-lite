import {
  Component, Input
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UnitInListDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-unit-groups',
  templateUrl: './unit-groups.component.html',
  styleUrls: ['./unit-groups.component.scss']
})
export class UnitGroupsComponent {
  numberOfGroups!: number;
  numberOfUnits!: number;
  expandedGroups!: number;
  expandAll = new BehaviorSubject<boolean>(true);
  @Input() selectedUnitId!: number;
  @Input('unitGroupList') set setU(unitList: { [p: string]: UnitInListDto[] }) {
    this.numberOfGroups = Object.keys(unitList).length;
    this.numberOfUnits = 0;
    this.expandedGroups = this.numberOfGroups;
    Object.values(unitList).forEach(units => {
      this.numberOfUnits += units.length;
    });
  }

  onExpandedChange(expanded:boolean) {
    if (expanded) {
      this.expandedGroups += 1;
    } else {
      this.expandedGroups -= 1;
    }
  }
}

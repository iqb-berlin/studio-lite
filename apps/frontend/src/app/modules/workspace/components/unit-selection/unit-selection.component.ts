import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChildren
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { Sort } from '@angular/material/sort';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NgFor, KeyValuePipe } from '@angular/common';
import { WorkspaceService } from '../../services/workspace.service';
// eslint-disable-next-line import/no-cycle
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { BackendService } from '../../services/backend.service';
import { UnitTableComponent } from '../unit-table/unit-table.component';
import { UnitGroupComponent } from '../unit-group/unit-group.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { UnitGroupsComponent } from '../unit-groups/unit-groups.component';

@Component({
  selector: 'studio-lite-unit-selection',
  templateUrl: './unit-selection.component.html',
  styleUrls: ['./unit-selection.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [UnitGroupsComponent, SearchFilterComponent, UnitTableComponent, NgFor, UnitGroupComponent, KeyValuePipe, TranslateModule]
})
export class UnitSelectionComponent extends SelectUnitDirective
  implements OnInit, OnDestroy {
  numberOfGroups!: number;
  numberOfUnits!: number;
  expandedGroups!: number;
  groupsInfo: string = '';
  unitList!:{ [p: string]: UnitInListDto[] };
  private ngUnsubscribe = new Subject<void>();
  @ViewChildren(UnitTableComponent) unitTables!: UnitTableComponent[];
  @Input() selectedUnitId!: number;
  @Input('unitList') set setU(unitList: { [p: string]: UnitInListDto[] }) {
    this.unitList = unitList;
    this.numberOfGroups = Object.keys(unitList).length;
    this.numberOfUnits = 0;
    this.expandedGroups = this.numberOfGroups;
    Object.values(unitList).forEach(units => {
      this.numberOfUnits += units.length;
    });
    this.groupsInfo = '';
    if (this.numberOfGroups > 1) {
      this.groupsInfo += `${this.numberOfGroups} ${this.translateService.instant('workspace.groups')} |`;
    } else {
      this.groupsInfo += `${this.numberOfGroups} ${this.translateService.instant('workspace.group')} |`;
    }
    if (this.numberOfUnits > 1) {
      this.groupsInfo += ` ${this.numberOfUnits} ${this.translateService.instant('workspace.units')}`;
    } else {
      this.groupsInfo += ` ${this.numberOfUnits} ${this.translateService.instant('workspace.unit')}`;
    }
  }

  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    public backendService: BackendService,
    private translateService: TranslateService
  ) {
    super();
    this.workspaceService.onCommentsUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.updateUnitList());
  }

  onExpandedChange(expanded:boolean) {
    if (expanded) {
      this.expandedGroups += 1;
    } else {
      this.expandedGroups -= 1;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit(): void {
    this.updateUnitList();
  }

  sortUnitTables(sortEvent: { sortState: Sort; table: UnitTableComponent }) {
    this.unitTables.forEach(unitTable => {
      if (unitTable !== sortEvent.table) {
        unitTable.sort(sortEvent.table.sortHeader);
      }
    });
  }
}

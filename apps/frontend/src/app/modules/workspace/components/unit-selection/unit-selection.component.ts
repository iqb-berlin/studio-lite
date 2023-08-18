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
import { WorkspaceService } from '../../services/workspace.service';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { BackendService } from '../../services/backend.service';
import { UnitTableComponent } from '../unit-table/unit-table.component';

@Component({
  selector: 'studio-lite-unit-selection',
  templateUrl: './unit-selection.component.html',
  styleUrls: ['./unit-selection.component.scss']
})
export class UnitSelectionComponent
  extends SelectUnitDirective
  implements OnInit, OnDestroy {
  @ViewChildren(UnitTableComponent) unitTables!: UnitTableComponent[];
  @Input() selectedUnitId!: number;
  @Input() unitList!: { [key: string]: UnitInListDto[] };
  expanded: boolean = true;
  private ngUnsubscribe = new Subject<void>();
  filterInput: string = '';
  numberOfGroups!: number;
  numberOfUnits!: number;
  expandedGroups!: number;
  @Input('unitGroupList') set setU(unitList: { [p: string]: UnitInListDto[] }) {
    this.numberOfGroups = Object.keys(unitList).length;
    this.numberOfUnits = 0;
    this.expandedGroups = this.numberOfGroups;
    Object.values(unitList).forEach(units => {
      this.numberOfUnits += units.length;
    });
  }

  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    public backendService: BackendService
  ) {
    super();
    this.workspaceService.onCommentsUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.updateUnitList());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit(): void {
    this.updateUnitList();
  }

  onExpandedChange(expanded:boolean) {
    if (expanded) {
      this.expandedGroups += 1;
    } else {
      this.expandedGroups -= 1;
    }
    if (this.expandedGroups === 0) {
      this.expanded = false;
    }
    if (this.expandedGroups === this.numberOfGroups) {
      this.expanded = true;
    }
    console.log('expandedGroups', this.expandedGroups, this.expanded);
  }

  sortUnitTables(sortEvent: { sortState: Sort; table: UnitTableComponent }) {
    this.unitTables.forEach(unitTable => {
      if (unitTable !== sortEvent.table) {
        unitTable.sort(sortEvent.table.sortHeader);
      }
    });
  }
}

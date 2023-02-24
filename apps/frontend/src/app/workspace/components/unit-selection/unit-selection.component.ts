import {
  Component, Input, OnDestroy, OnInit, ViewChildren
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { Sort } from '@angular/material/sort';
import { WorkspaceService } from '../../workspace.service';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { BackendService } from '../../backend.service';
import { UnitTableComponent } from '../unit-table/unit-table.component';

@Component({
  selector: 'studio-lite-unit-selection',
  templateUrl: './unit-selection.component.html',
  styleUrls: ['./unit-selection.component.scss']
})
export class UnitSelectionComponent extends SelectUnitDirective implements OnInit, OnDestroy {
  @ViewChildren(UnitTableComponent) unitTables!: UnitTableComponent[];
  @Input() selectedUnitId!: number;
  @Input() unitList!: { [key: string]: UnitInListDto[] };
  private ngUnsubscribe = new Subject<void>();

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

  sortUnitTables(sortEvent: { sortState: Sort, table: UnitTableComponent }) {
    this.unitTables.forEach(unitTable => {
      if (unitTable !== sortEvent.table) {
        unitTable.sort(sortEvent.table.sortHeader);
      }
    });
  }
}

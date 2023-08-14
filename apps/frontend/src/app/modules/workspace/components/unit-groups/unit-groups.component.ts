import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'studio-lite-unit-groups',
  templateUrl: './unit-groups.component.html',
  styleUrls: ['./unit-groups.component.scss']
})
export class UnitGroupsComponent extends SelectUnitDirective {
  @Input() selectedUnitId!: number;
  numberOfGroups: number = 0;
  numberOfUnits: number = 0;
  @Input('unitGroupList') set setU(unitList: { [p: string]: UnitInListDto[] }) {
    this.unitList = unitList;
    this.numberOfGroups = Object.keys(unitList).length;
    Object.values(unitList).forEach((arr) => {
      this.numberOfUnits += arr.length;
    });
  }

  @Input() filter!: string;
  @Input() expanded!: boolean;
  unitList!: { [p: string]: UnitInListDto[] };
  count: number = 2;
  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    public backendService: BackendService
  ) {
    super();
  }
}

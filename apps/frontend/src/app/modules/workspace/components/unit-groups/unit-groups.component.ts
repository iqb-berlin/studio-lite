import { Component, Input } from '@angular/core';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'studio-lite-unit-groups',
  templateUrl: './unit-groups.component.html',
  styleUrls: ['./unit-groups.component.scss']
})
export class UnitGroupsComponent extends SelectUnitDirective {
  @Input() selectedUnitId!: number;
  @Input() unitList!: { [key: string]: UnitInListDto[] };
  @Input() filter!: string;
  expanded: boolean = true;
  constructor(
    public backendService: BackendService,
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute
  ) {
    super();
  }
}

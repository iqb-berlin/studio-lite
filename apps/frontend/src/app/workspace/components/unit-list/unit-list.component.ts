import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from '../../workspace.service';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { BackendService } from '../../backend.service';

@Component({
  selector: 'studio-lite-unit-list',
  templateUrl: './unit-list.component.html',
  styleUrls: ['./unit-list.component.scss']
})
export class UnitListComponent extends SelectUnitDirective {
  @Input() selectedUnitId!: number;

  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    public backendService: BackendService
  ) {
    super();
  }
}

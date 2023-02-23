import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { WorkspaceService } from '../../workspace.service';
import { BackendService } from '../../backend.service';

@Component({
  selector: 'studio-lite-update-units-button',
  templateUrl: './update-units-button.component.html',
  styleUrls: ['./update-units-button.component.scss']
})
export class UpdateUnitsButtonComponent extends SelectUnitDirective {
  constructor(
    public workspaceService: WorkspaceService,
    public router: Router,
    public route: ActivatedRoute,
    public backendService: BackendService
  ) {
    super();
  }
}

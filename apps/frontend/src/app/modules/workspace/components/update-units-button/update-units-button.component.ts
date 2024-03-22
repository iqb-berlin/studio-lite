import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService } from '../../services/backend.service';
import { TranslateModule } from '@ngx-translate/core';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'studio-lite-update-units-button',
    templateUrl: './update-units-button.component.html',
    styleUrls: ['./update-units-button.component.scss'],
    standalone: true,
    imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
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

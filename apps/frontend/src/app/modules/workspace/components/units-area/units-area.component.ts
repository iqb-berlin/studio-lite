import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceService } from '../../services/workspace.service';
import { EditUnitButtonComponent } from '../edit-unit-button/edit-unit-button.component';
import { DeleteUnitButtonComponent } from '../delete-unit-button/delete-unit-button.component';
import { AddUnitButtonComponent } from '../add-unit-button/add-unit-button.component';
import { UnitSelectionComponent } from '../unit-selection/unit-selection.component';
import { UpdateUnitsButtonComponent } from '../update-units-button/update-units-button.component';
import { UnitSaveButtonComponent } from '../unit-save-button/unit-save-button.component';

@Component({
  selector: 'studio-lite-units-area',
  templateUrl: './units-area.component.html',
  styleUrls: ['./units-area.component.scss'],
  standalone: true,
  imports: [UnitSaveButtonComponent, UpdateUnitsButtonComponent, UnitSelectionComponent, AddUnitButtonComponent,
    DeleteUnitButtonComponent, EditUnitButtonComponent, AsyncPipe, TranslateModule]
})
export class UnitsAreaComponent implements OnInit, OnDestroy {
  @Input() selectedRouterLink!: number;
  @Input() navLinks!: string[];
  private ngUnsubscribe = new Subject<void>();
  constructor(
    public workspaceService: WorkspaceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        this.workspaceService.resetUnitData();
        const unitParamKey = 'u';
        const unitParam = params[unitParamKey];
        let unitParamNum = unitParam ? Number(unitParam) : 0;
        if (Number.isNaN(unitParamNum)) unitParamNum = 0;
        this.workspaceService.selectedUnit$.next(unitParamNum);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

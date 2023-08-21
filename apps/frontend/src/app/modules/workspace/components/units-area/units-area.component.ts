import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'studio-lite-units-area',
  templateUrl: './units-area.component.html',
  styleUrls: ['./units-area.component.scss']
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

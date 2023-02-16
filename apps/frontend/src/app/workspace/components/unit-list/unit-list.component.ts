import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WorkspaceService } from '../../workspace.service';
import { SelectUnitDirective } from '../../directives/select-unit.directive';
import { BackendService } from '../../backend.service';

@Component({
  selector: 'studio-lite-unit-list',
  templateUrl: './unit-list.component.html',
  styleUrls: ['./unit-list.component.scss']
})
export class UnitListComponent extends SelectUnitDirective implements OnInit, OnDestroy {
  @Input() selectedUnitId!: number;
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
}

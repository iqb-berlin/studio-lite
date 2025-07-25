import { Component, OnDestroy } from '@angular/core';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';
import { CommentsComponent } from '../../../comments/components/comments/comments.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { SortAscendingPipe } from '../../../comments/pipes/sort-ascending.pipe';

@Component({
  templateUrl: './unit-comments.component.html',
  styleUrls: ['./unit-comments.component.scss'],
  imports: [CommentsComponent]
})
export class UnitCommentsComponent implements OnDestroy {
  userName: string = '';
  userId: number = 0;
  unitId: number = 0;
  workspaceId: number = 0;
  unitItems: UnitItemDto[] = [];
  private ngUnsubscribe = new Subject<void>();

  constructor(
    public appService: AppService,
    public workspaceService: WorkspaceService,
    private workspaceBackendService: WorkspaceBackendService
  ) {
    this.workspaceService.selectedUnit$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(unitId => {
          this.updateComments(unitId);
          return this.workspaceBackendService
            .getUnitItems(this.workspaceService.selectedWorkspaceId, unitId);
        })
      )
      .subscribe(items => this.setUnitItems(items));
  }

  private setUnitItems(items: UnitItemDto[]) {
    this.unitItems = items
      .sort((a, b) => SortAscendingPipe
        .sortAscending(a, b, 'id'));
  }

  private updateComments(unitId: number) {
    this.reset();
    setTimeout(() => {
      this.unitId = unitId;
      this.workspaceId = this.workspaceService.selectedWorkspaceId;
      this.userId = this.appService.authData.userId;
      this.userName = this.appService.authData.userLongName || this.appService.authData.userName;
    });
  }

  private reset(): void {
    this.userId = 0;
    this.unitId = 0;
    this.workspaceId = 0;
    this.userName = '';
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

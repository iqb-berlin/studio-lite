import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppService } from '../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  templateUrl: './unit-comments.component.html',
  styleUrls: ['./unit-comments.component.scss']
})
export class UnitCommentsComponent implements OnDestroy {
  userName: string = '';
  userId: number = 0;
  unitId: number = 0;
  workspaceId: number = 0;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    public appService: AppService,
    public workspaceService: WorkspaceService
  ) {
    this.workspaceService.selectedUnit$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        this.updateComments(result);
      });
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

import { Component, OnDestroy } from '@angular/core';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { AppService } from '../../../app.service';
import { WorkspaceService } from '../../workspace.service';
import { BackendService } from '../../../backend.service';

@Component({
  selector: 'studio-lite-unit-comments',
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
    public workspaceService: WorkspaceService,
    private backendService: BackendService
  ) {
    combineLatest([
      this.workspaceService.selectedUnit$,
      this.backendService.getMyData()
    ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        this.unitId = result[0];
        this.workspaceId = this.workspaceService.selectedWorkspaceId;
        this.userId = this.appService.authData.userId;
        const displayName = (result[1].lastName ? result[1].lastName : this.appService.authData.userName) as string;
        this.userName = result[1].firstName ? `${displayName}, ${result[1].firstName}` : displayName;
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

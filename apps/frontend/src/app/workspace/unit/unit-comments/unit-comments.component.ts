import { Component, OnDestroy } from '@angular/core';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { MyDataDto } from '@studio-lite-lib/api-dto';
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
      .subscribe(result => this.updateComments(result[0], result[1] ? result[1] : undefined));
  }

  private updateComments(unitId: number, userData?: MyDataDto) {
    this.reset();
    setTimeout(() => {
      this.unitId = unitId;
      this.workspaceId = this.workspaceService.selectedWorkspaceId;
      this.userId = this.appService.authData.userId;
      const displayName = (userData && userData.lastName ?
        userData.lastName : this.appService.authData.userName) as string;
      this.userName = userData && userData.firstName ?
        `${displayName}, ${userData.firstName}` : displayName;
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

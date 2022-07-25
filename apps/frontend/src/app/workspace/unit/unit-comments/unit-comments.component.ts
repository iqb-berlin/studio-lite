import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AppService } from '../../../app.service';
import { WorkspaceService } from '../../workspace.service';
import { BackendService } from '../../../backend.service';

@Component({
  selector: 'studio-lite-unit-comments',
  templateUrl: './unit-comments.component.html',
  styleUrls: ['./unit-comments.component.scss']
})
export class UnitCommentsComponent implements OnInit, OnDestroy {
  userName: string = '';
  userId: number = 0;
  unitId: number = 0;
  workspaceId: number = 0;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    public appService: AppService,
    private workspaceService: WorkspaceService,
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    this.workspaceService.selectedUnit$
      .subscribe(unitId => {
        this.unitId = unitId;
        this.workspaceId = this.workspaceService.selectedWorkspaceId;
      });
    this.backendService.getMyData()
      .subscribe(myData => {
        if (myData) {
          this.userId = this.appService.authData.userId;
          const displayName = (myData.lastName ? myData.lastName : this.appService.authData.userName) as string;
          this.userName = myData.firstName ? `${displayName}, ${myData.firstName}` : displayName;
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

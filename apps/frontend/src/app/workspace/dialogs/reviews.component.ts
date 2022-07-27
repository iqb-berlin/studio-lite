import { Component, OnInit, ViewChild } from '@angular/core';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { BackendService } from '../backend.service';
import { WorkspaceService } from '../workspace.service';
import { SelectUnitListComponent } from './components/select-unit-list.component';
import { AppService } from '../../app.service';

@Component({
  templateUrl: './reviews.component.html',
  styles: [
    '.margin-bottom {margin-bottom: 10px}',
    '.tcMessage {font-style: italic; font-size: smaller}'
  ]
})
export class ReviewsComponent implements OnInit {
  @ViewChild('unitSelectionTable') unitSelectionTable: SelectUnitListComponent | undefined;
  unitExportSettings = <UnitDownloadSettingsDto>{
    unitIdList: [],
    addPlayers: false,
    addTestTakersReview: 0,
    addTestTakersMonitor: 0,
    addTestTakersHot: 0,
    passwordLess: false,
    bookletSettings: [
      { key: 'pagingMode', value: 'separate' },
      { key: 'unit_navibuttons', value: 'FULL' }
    ]
  };

  unitsWithOutPlayer: number[] = [];
  enablePlayerOption = true;

  constructor(
    public workspaceService: WorkspaceService,
    public appService: AppService,
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      // todo getReviews
    });
  }
}

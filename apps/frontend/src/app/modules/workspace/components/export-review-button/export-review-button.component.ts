import { Component, Input, OnDestroy } from '@angular/core';
import { BookletConfigDto, UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { format } from 'date-fns';
import { saveAs } from 'file-saver-es';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { ExportUnitComponent } from '../export-unit/export-unit.component';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-export-review-button',
  templateUrl: './export-review-button.component.html',
  styleUrls: ['./export-review-button.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class ExportReviewButtonComponent implements OnDestroy {
  @Input() bookletConfigSettings!: BookletConfigDto | undefined;
  @Input() workspaceId!: number;
  @Input() units!: number[];
  @Input() selectedReviewId!: number;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    public workspaceService: WorkspaceService,
    public backendService: WorkspaceBackendService,
    private appService: AppService) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  exportReview(): void {
    const dialogRef = this.dialog
      .open(ExportUnitComponent, {
        width: '900px',
        data: { units: this.units, bookletConfigSettings: this.bookletConfigSettings }
      });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((result: UnitDownloadSettingsDto | boolean) => {
        if (result !== false) {
          this.appService.dataLoading = true;
          const settings = result as UnitDownloadSettingsDto;
          const download$ = settings.exportFormat === 'json' ?
            this.backendService.downloadUnitsJson(this.workspaceService.selectedWorkspaceId, settings) :
            this.backendService.downloadUnits(this.workspaceService.selectedWorkspaceId, settings);
          download$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(b => {
            if (b) {
              if (typeof b === 'number') {
                this.appService.dataLoading = b;
              } else {
                const thisMoment = format(new Date(), 'yyyy-MM-dd');
                saveAs(b, `${thisMoment} studio unit download.zip`);
                this.appService.dataLoading = false;
              }
            }
          });
        }
      });
  }
}

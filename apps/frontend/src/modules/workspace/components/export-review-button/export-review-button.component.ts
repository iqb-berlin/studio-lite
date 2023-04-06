import { Component, Input } from '@angular/core';
import { BookletConfigDto, UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { format } from 'date-fns';
import { saveAs } from 'file-saver-es';
import { MatDialog } from '@angular/material/dialog';
import { ExportUnitComponent } from '../../dialogs/export-unit/export-unit.component';
import { AppService } from '../../../../app/services/app.service';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'studio-lite-export-review-button',
  templateUrl: './export-review-button.component.html',
  styleUrls: ['./export-review-button.component.scss']
})
export class ExportReviewButtonComponent {
  @Input() bookletConfigSettings!: BookletConfigDto | undefined;
  @Input() workspaceId!: number;
  @Input() units!: number[];
  @Input() selectedReviewId!: number;
  constructor(
    private dialog: MatDialog,
    public workspaceService: WorkspaceService,
    public backendService: BackendService,
    private appService: AppService) {}

  exportReview(): void {
    const dialogRef = this.dialog
      .open(ExportUnitComponent, {
        width: '900px',
        data: { units: this.units, bookletConfigSettings: this.bookletConfigSettings }
      });

    dialogRef.afterClosed()
      .subscribe((result: UnitDownloadSettingsDto | boolean) => {
        if (result !== false) {
          this.appService.dataLoading = true;
          this.backendService.downloadUnits(
            this.workspaceService.selectedWorkspaceId,
            result as UnitDownloadSettingsDto
          ).subscribe(b => {
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

import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  PrintOptionsDialogComponent
} from '../../../print/components/print-options-dialog/print-options-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'studio-lite-print-review-button',
    templateUrl: './print-review-button.component.html',
    styleUrls: ['./print-review-button.component.scss'],
    standalone: true,
    imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class PrintReviewButtonComponent {
  @Input() workspaceId!: number;
  @Input() workspaceGroupId!: number;
  @Input() units!: number[];
  @Input() selectedReviewId!: number;

  constructor(private dialog: MatDialog,
              private router: Router) {}

  showPrintOptions(): void {
    const dialogRef = this.dialog
      .open(PrintOptionsDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.openPrintView(result);
      }
    });
  }

  openPrintView(options: { key: string; value: boolean | number }[]): void {
    const printOptions = options
      .filter((option: { key: string; value: boolean | number }) => option.value === true)
      .map((option: { key: string; value: boolean | number }) => option.key);
    const printPreviewHeight = options
      .find(option => option.key === 'printPreviewHeight')?.value || 0;
    const url = this.router
      .serializeUrl(this.router
        .createUrlTree(['/print'], {
          queryParams: {
            printPreviewHeight: printPreviewHeight,
            printOptions: printOptions,
            unitIds: this.units,
            workspaceId: this.workspaceId,
            workspaceGroupId: this.workspaceGroupId
          }
        }));
    window.open(`#${url}`, '_blank');
  }
}

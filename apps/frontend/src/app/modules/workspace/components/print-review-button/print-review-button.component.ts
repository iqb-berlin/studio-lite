import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  PrintOptionsDialogComponent
} from '../../../print/components/print-options-dialog/print-options-dialog.component';

@Component({
  selector: 'studio-lite-print-review-button',
  templateUrl: './print-review-button.component.html',
  styleUrls: ['./print-review-button.component.scss']
})
export class PrintReviewButtonComponent {
  @Input() workspaceId!: number;
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

  openPrintView(options: { key: string; value: boolean }[]): void {
    const printOptions = options
      .filter((option: { key: string; value: boolean }) => option.value)
      .map((option: { key: string; value: boolean }) => option.key);
    const url = this.router
      .serializeUrl(this.router
        .createUrlTree(['/print'], {
          queryParams: {
            printOptions: printOptions,
            unitIds: this.units,
            workspaceId: this.workspaceId
          }
        }));
    window.open(`#${url}`, '_blank');
  }
}

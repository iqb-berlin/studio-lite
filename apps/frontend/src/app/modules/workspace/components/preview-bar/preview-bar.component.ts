import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { Response } from '@iqb/responses';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PageData } from '../../models/page-data.interface';
import { WorkspaceService } from '../../services/workspace.service';
import { Progress } from '../../models/types';
import {
  PrintOptionsDialogComponent
} from '../../../print/components/print-options-dialog/print-options-dialog.component';

@Component({
  selector: 'studio-lite-preview-bar',
  templateUrl: './preview-bar.component.html',
  styleUrls: ['./preview-bar.component.scss']
})
export class PreviewBarComponent {
  @Input() pageList!: PageData[];
  @Input() unitId!: number;
  @Input() playerApiVersion!: number;
  @Input() postMessageTarget!: Window | undefined;
  @Input() playerName!: string;
  @Input() presentationProgress!: Progress;
  @Input() responseProgress!: Progress;
  @Input() hasFocus!: boolean;
  @Input() responses!: Response[];
  @Output() gotoPage = new EventEmitter<{ action: string, index?: number }>();
  @Output() navigationDenied = new EventEmitter<void>();
  @Output() checkCoding = new EventEmitter<void>();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    public workspaceService: WorkspaceService
  ) {
  }

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
            unitIds: [this.unitId],
            workspaceId: this.workspaceService.selectedWorkspaceId,
            workspaceGroupId: this.workspaceService.groupId
          }
        }));
    window.open(`#${url}`, '_blank');
  }
}

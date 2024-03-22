import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { Response } from '@iqb/responses';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton, MatIconButton } from '@angular/material/button';
import { PageData } from '../../models/page-data.interface';
import { WorkspaceService } from '../../services/workspace.service';
import { Progress } from '../../models/types';
import {
  PrintOptionsDialogComponent
} from '../../../print/components/print-options-dialog/print-options-dialog.component';
import { PageNavigationComponent } from '../../../shared/components/page-navigation/page-navigation.component';
import { PagingModeSelectionComponent } from '../paging-mode-selection/paging-mode-selection.component';
import { StatusIndicationComponent } from '../status-indication/status-indication.component';

@Component({
  selector: 'studio-lite-preview-bar',
  templateUrl: './preview-bar.component.html',
  styleUrls: ['./preview-bar.component.scss'],
  standalone: true,
  imports: [StatusIndicationComponent, MatButton, MatTooltip, NgIf, PagingModeSelectionComponent, MatIconButton, MatIcon, PageNavigationComponent, TranslateModule]
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

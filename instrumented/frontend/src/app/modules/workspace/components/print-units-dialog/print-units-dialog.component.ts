import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { WorkspaceService } from '../../services/workspace.service';
import { PrintOption, PrintOptions } from '../../../print/models/print-options.interface';
import { PrintOptionsComponent } from '../../../shared/components/print-options/print-options.component';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';

@Component({
  selector: 'studio-lite-print-units-dialog',
  templateUrl: './print-units-dialog.component.html',
  styleUrls: ['./print-units-dialog.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, MatDialogContent, SelectUnitListComponent, PrintOptionsComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})
export class PrintUnitsDialogComponent {
  unitPrintSettings: {
    printPreviewHeight: number;
    unitIds: number[];
    printOptions: PrintOption[];
  } = {
      printPreviewHeight: 0,
      unitIds: [],
      printOptions: []
    };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[] },
    public workspaceService: WorkspaceService
  ) {
  }

  setPrintSettings(printOptions: PrintOptions[]) {
    this.unitPrintSettings.printOptions = printOptions
      .filter(option => option.value === true)
      .map(option => option.key);
    this.unitPrintSettings.printPreviewHeight = printOptions
      .find(option => option.key === 'printPreviewHeight')?.value as number || 0;
  }
}

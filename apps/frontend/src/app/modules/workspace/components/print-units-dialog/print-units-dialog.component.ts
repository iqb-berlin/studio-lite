import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceService } from '../../services/workspace.service';
import { PrintOption, PrintOptions } from '../../../print/models/print-options.interface';

@Component({
  selector: 'studio-lite-print-units-dialog',
  templateUrl: './print-units-dialog.component.html',
  styleUrls: ['./print-units-dialog.component.scss']
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

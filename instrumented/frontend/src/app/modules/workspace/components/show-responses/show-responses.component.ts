import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogTitle } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { JsonPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Response } from '@iqbspecs/response/response.interface';
import {
  MatCell,
  MatCellDef,
  MatColumnDef, MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';

@Component({
  templateUrl: './show-responses.component.html',
  imports: [
    TranslateModule,
    MatDialogModule,
    MatDialogTitle,
    MatButton,
    JsonPipe,
    MatTable,
    MatHeaderCellDef,
    MatCellDef,
    MatColumnDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRowDef,
    MatRow,
    MatCell,
    MatHeaderCell
  ],
  styleUrls: ['show-responses.component.scss']
})

export class ShowResponsesComponent {
  displayedColumns: string[] = [];
  dataSource: Response[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: { responses: Response[], table: boolean }) {
    if (data.table) this.initTable();
  }

  private initTable() {
    this.displayedColumns = (this.data.responses && this.data.responses.length) ?
      Object.keys(this.data.responses[0]) : [];
    this.dataSource = this.data.responses;
  }
}

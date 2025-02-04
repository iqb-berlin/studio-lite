import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import {
  Component, Inject, OnInit, ViewChild
} from '@angular/core';
import { Response } from '@iqb/responses';
import {
  MatCell, MatCellDef,
  MatColumnDef, MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatInput } from '@angular/material/input';

type Data = {
  responses:Response[],
  varsWithCodes:string[]
};
@Component({
  template: `
    <div mat-dialog-title class="fx-column-start-start title">
      <span>{{'coding.result' | translate}}</span>
      <mat-form-field class="filter">
        <mat-label>{{'filter-by' | translate}}</mat-label>
        <input matInput (keyup)="applyFilter($event )" #input>
      </mat-form-field>
      <mat-slide-toggle class="toggle" name='codedVariablesOnly'
                        [checked]="codedVariablesOnly"
                        (change)="toggleChange($event)">
        {{'coding.vars-with-codes-only' | translate}}
      </mat-slide-toggle>
      <mat-slide-toggle class="toggle" name='rawResponsesView'
                        [checked]="rawResponsesView"
                        (change)="toggleChange($event)">
        {{'coding.raw-responses' | translate}}
      </mat-slide-toggle>
    </div>
    <mat-dialog-content>
      @if (isLoading) {
        <mat-spinner></mat-spinner>
      }
      @if (!isLoading) {
        @if(rawResponsesView){
          {{JSON.stringify(this.dataSource.data)}}
        } @else {
          <table mat-table matSort matSortActive="id" matSortDirection="asc"
                 (matSortChange)="matSort(sort)" [dataSource]="dataSource" >
            @for (column of displayedColumns; track column) {
              <ng-container [matColumnDef]="column">
                <th mat-header-cell  *matHeaderCellDef  mat-sort-header> {{ ('coding.' + column) | translate}}</th>
                <td mat-cell [innerHTML]="element[column]" *matCellDef="let element"></td>
              </ng-container>
            }
            <tr mat-header-row  *matHeaderRowDef="displayedColumns;sticky:true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        }
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-raised-button
              color="primary"
              [mat-dialog-close]="false">
        {{'close' | translate}}
      </button>
    </mat-dialog-actions>`,
  styles: [
    '.filter{width:100%;margin-top:10px}',
    '.toggle{margin-left:15px}',
    '.title{display:inline!important}'

  ],
  standalone: true,
  imports: [MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslateModule,
    TranslateModule,
    MatProgressSpinner,
    MatSlideToggle,
    MatLabel,
    MatFormField,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatRowDef,
    MatRow,
    MatCell,
    MatHeaderCell,
    MatHeaderRowDef,
    MatSort,
    MatInput,
    MatHeaderRow,
    MatCellDef,
    MatSortHeader]
})

export class ShowCodingResultsComponent implements OnInit {
  dataSource = new MatTableDataSource();
  displayedColumns = ['id', 'value', 'status', 'code', 'score', 'subform'];
  isLoading = false;
  codedVariablesOnly = true;
  rawResponsesView = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: Data) {

  }

  @ViewChild(MatSort) sort!: MatSort;
  matSort(sort: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  ngOnInit() {
    if (this.codedVariablesOnly && this.data.responses) {
      this.dataSource.data = this.data.responses
        .filter(response => this.data.varsWithCodes.includes(response.id));
    } else {
      this.dataSource.data = this.data.responses;
    }
  }

  applyFilter(event:Event) {
    const { target } = event;
    if (target) {
      const filterValue = (target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim()
        .toLowerCase();
    }
  }

  toggleChange(event: MatSlideToggleChange) {
    if (event.source.name === 'rawResponsesView') {
      this.rawResponsesView = !this.rawResponsesView;
    } else if (event.source.name === 'codedVariablesOnly') {
      this.codedVariablesOnly = !this.codedVariablesOnly;
      if (this.codedVariablesOnly) {
        this.dataSource.data = this.data.responses
          .filter(response => this.data.varsWithCodes.includes(response.id));
      } else {
        this.dataSource.data = this.data.responses;
      }
    }
  }

  protected readonly JSON = JSON;
}

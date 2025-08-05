import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import {
  // eslint-disable-next-line max-len
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver-es';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { DatePipe } from '@angular/common';
import { BytesPipe } from '@studio-lite-lib/iqb-components';
import { BackendService } from '../../services/backend.service';
import { VeronaModuleClass } from '../../../shared/models/verona-module.class';
import { IsAllSelectedPipe } from '../../../shared/pipes/isAllSelected.pipe';
import { HasSelectionValuePipe } from '../../../shared/pipes/hasSelectionValue.pipe';
import { IsSelectedPipe } from '../../../shared/pipes/isSelected.pipe';
import { I18nService } from '../../../../services/i18n.service';

@Component({
  selector: 'studio-lite-verona-modules-table',
  templateUrl: './verona-modules-table.component.html',
  styleUrls: ['./verona-modules-table.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatButton, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatAnchor, MatTooltip, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DatePipe, BytesPipe, TranslateModule, IsSelectedPipe, IsAllSelectedPipe, HasSelectionValuePipe]
})
export class VeronaModulesTableComponent implements OnInit, OnDestroy {
  @Input() type!: 'editor' | 'player' | 'schemer';
  @Input()
  set modules(value: { [key: string]: VeronaModuleClass }) {
    this.objectsDatasource = new MatTableDataSource(
      Object.keys(value).map(m => value[m])
    );
    this.objectsDatasource.sort = this.sort;
    setTimeout(() => this.tableSelectionCheckboxes.clear());
  }

  @Output() selectionChanged = new EventEmitter();
  @ViewChild(MatSort) sort = new MatSort();
  objectsDatasource = new MatTableDataSource<VeronaModuleClass>();
  tableSelectionCheckboxes = new SelectionModel <VeronaModuleClass>(true, []);
  displayedColumns = ['selectCheckbox', 'name', 'id', 'version', 'veronaVersion', 'fileDateTime', 'filesize'];
  private selectionChangedSubscription: Subscription | undefined;

  constructor(
    private backendService: BackendService,
    public i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this.selectionChangedSubscription = this.tableSelectionCheckboxes.changed.subscribe(() => {
      this.selectionChanged.emit({ type: this.type, selectedModules: this.tableSelectionCheckboxes.selected });
    });
  }

  private isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckboxes.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return IsAllSelectedPipe.isAllSelected(numSelected, numRows);
  }

  masterToggleSelection(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableSelectionCheckboxes.clear() :
      this.objectsDatasource.data.forEach(row => this.tableSelectionCheckboxes.select(row));
  }

  ngOnDestroy(): void {
    if (this.selectionChangedSubscription) {
      this.selectionChangedSubscription.unsubscribe();
    }
  }

  downloadModule(key: string, id: string, version: string) {
    this.backendService.downloadModule(key).subscribe(b => {
      saveAs(b, `${id}-${version}.html`);
    });
  }
}

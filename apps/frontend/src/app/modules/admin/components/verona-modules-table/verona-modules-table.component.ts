import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver-es';
import { BackendService } from '../../services/backend.service';
import { VeronaModuleClass } from '../../../shared/models/verona-module.class';

@Component({
  selector: 'studio-lite-verona-modules-table',
  templateUrl: './verona-modules-table.component.html',
  styleUrls: ['./verona-modules-table.component.scss']
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
  timeZone = 'Europe/Berlin';
  displayedColumns = ['selectCheckbox', 'name', 'id', 'version', 'veronaVersion', 'fileDateTime', 'filesize'];
  private selectionChangedSubscription: Subscription | undefined;

  constructor(
    private backendService: BackendService
  ) {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  ngOnInit(): void {
    this.selectionChangedSubscription = this.tableSelectionCheckboxes.changed.subscribe(() => {
      this.selectionChanged.emit({ type: this.type, selectedModules: this.tableSelectionCheckboxes.selected });
    });
  }

  isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckboxes.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return numSelected === numRows;
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
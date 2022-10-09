import {
  AfterViewInit,
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { VeronaModuleInListDto, VeronaModuleMetadataDto } from '@studio-lite-lib/api-dto';
import { saveAs } from 'file-saver';
import { BackendService } from '../backend.service';
import { BackendService as AppBackendService } from '../../backend.service';
import { VeronaModuleCollection } from '../../classes/verona-module-collection.class';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-verona-modules-table',
  templateUrl: './verona-modules-table.component.html'
})
export class VeronaModulesTableComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  @Input() type!: 'player' | 'editor' | 'schemer';
  @Output() selectionChanged = new EventEmitter();
  @ViewChild(MatSort) sort = new MatSort();
  objectsDatasource = new MatTableDataSource<VeronaModuleInListDto>();
  tableSelectionCheckboxes = new SelectionModel <VeronaModuleInListDto>(true, []);
  timeZone = 'Europe/Berlin';
  displayedColumns = ['selectCheckbox', 'name', 'id', 'version', 'veronaVersion', 'fileDateTime', 'filesize'];
  private selectionChangedSubscription: Subscription | undefined;

  constructor(
    private backendService: BackendService,
    private appBackendService: AppBackendService,
    private appService: AppService
  ) {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  ngOnInit(): void {
    this.selectionChangedSubscription = this.tableSelectionCheckboxes.changed.subscribe(() => {
      this.selectionChanged.emit({ type: this.type, selectedModules: this.tableSelectionCheckboxes.selected });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateList();
    });
  }

  updateList() {
    this.appBackendService.getModuleList(this.type).subscribe(
      (fileData: VeronaModuleInListDto[]) => {
        if (fileData) {
          const moduleCollection = new VeronaModuleCollection(fileData);
          if (this.type === 'editor') {
            this.appService.editorList = moduleCollection;
          } else if (this.type === 'player') {
            this.appService.playerList = moduleCollection;
          } else {
            this.appService.schemerList = moduleCollection;
          }
          this.objectsDatasource = new MatTableDataSource(fileData);
          this.objectsDatasource.sortingDataAccessor = (item, property) => ((property.includes('.')) ?
            property.split('.')
              .reduce((metaData: unknown, i: string) => (metaData as VeronaModuleMetadataDto)[i], item) :
            (item)[property]);
          this.objectsDatasource.sort = this.sort;
        } else {
          this.objectsDatasource = new MatTableDataSource();
        }
      }
    );
  }

  ngOnChanges(): void {
    this.updateList();
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

  hasObjects(): boolean {
    if (this.objectsDatasource == null) {
      return false;
    }
    return this.objectsDatasource.data.length > 0;
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

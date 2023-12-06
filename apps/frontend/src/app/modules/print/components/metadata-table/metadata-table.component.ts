import { Component, Input, OnInit } from '@angular/core';
import { MetadataEntry } from '../../models/metadata-entry.class';

@Component({
  selector: 'studio-lite-metadata-table',
  templateUrl: './metadata-table.component.html',
  styleUrls: ['./metadata-table.component.scss']
})
export class MetadataTableComponent implements OnInit {
  @Input() metadata!: any;
  displayedColumns: string[] = ['id', 'label', 'value'];
  entries: MetadataEntry[] = [];

  ngOnInit(): void {
    this.entries = this.metadata.entries.map((entry: any) => new MetadataEntry(entry));
  }
}

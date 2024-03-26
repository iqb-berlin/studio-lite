import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'studio-lite-metadata-profile-entries',
  templateUrl: './metadata-profile-entries.component.html',
  styleUrls: ['./metadata-profile-entries.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf]
})
export class MetadataProfileEntriesComponent {
  @Input() profiles!: any[];
}

import { Component, Input } from '@angular/core';


@Component({
  selector: 'studio-lite-metadata-profile-entries',
  templateUrl: './metadata-profile-entries.component.html',
  styleUrls: ['./metadata-profile-entries.component.scss'],
  standalone: true,
  imports: []
})
export class MetadataProfileEntriesComponent {
  @Input() profiles!: any[];
}

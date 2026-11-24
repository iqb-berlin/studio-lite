import { Component, Input } from '@angular/core';
import { ProfileValues } from '@studio-lite-lib/api-dto';
import { IsCurrentProfilePipe } from '../../pipes/is-current-profile.pipe';
import { FilledEntriesPipe } from '../../pipes/filled-entries.pipe';
import { GetLocalizedValuePipe } from '../../pipes/get-localized-value.pipe';
import { MetadataValueTextsPipe } from '../../pipes/metadata-value-texts.pipe';

/**
 * The filled fields of the current profile, read-only: in print, in the review and for the items
 * shown read-only. Field names and values appear in the language of the interface where the profile
 * and its vocabulary bring it (#2207).
 */
@Component({
  selector: 'studio-lite-metadata-profile-entries',
  templateUrl: './metadata-profile-entries.component.html',
  styleUrls: ['./metadata-profile-entries.component.scss'],
  imports: [
    IsCurrentProfilePipe,
    FilledEntriesPipe,
    GetLocalizedValuePipe,
    MetadataValueTextsPipe
  ]
})
export class MetadataProfileEntriesComponent {
  @Input() profiles!: ProfileValues[];
}

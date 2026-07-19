import { Component, Input } from '@angular/core';
import { ProfileValues } from '@studio-lite-lib/api-dto';
import { LanguageCodedText as TextWithLanguage } from '@iqbspecs/metadata-profile';
import { IsArrayPipe } from '../../pipes/is-array.pipe';
import { CastPipe } from '../../pipes/cast.pipe';
import { IsCurrentProfilePipe } from '../../pipes/is-current-profile.pipe';

@Component({
  selector: 'studio-lite-metadata-profile-entries',
  templateUrl: './metadata-profile-entries.component.html',
  styleUrls: ['./metadata-profile-entries.component.scss'],
  imports: [
    IsArrayPipe,
    CastPipe,
    IsCurrentProfilePipe
  ]
})
export class MetadataProfileEntriesComponent {
  @Input() profiles!: ProfileValues[];

  TextWithLanguageArray!: TextWithLanguage[];
  TextWithLanguage!: TextWithLanguage;
}

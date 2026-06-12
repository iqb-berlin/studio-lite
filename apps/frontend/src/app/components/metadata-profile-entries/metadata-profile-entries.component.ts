import { Component, Input } from '@angular/core';
import { MetadataValues } from '@studio-lite-lib/api-dto';
import { LanguageCodedText as TextWithLanguage } from '@iqbspecs/metadata-profile';
import { IsArrayPipe } from '../../pipes/is-array.pipe';
import { CastPipe } from '../../pipes/cast.pipe';

@Component({
  selector: 'studio-lite-metadata-profile-entries',
  templateUrl: './metadata-profile-entries.component.html',
  styleUrls: ['./metadata-profile-entries.component.scss'],
  imports: [
    IsArrayPipe,
    CastPipe
  ]
})
export class MetadataProfileEntriesComponent {
  @Input() profiles!: MetadataValues[];

  TextWithLanguageArray!: TextWithLanguage[];
  TextWithLanguage!: TextWithLanguage;
}

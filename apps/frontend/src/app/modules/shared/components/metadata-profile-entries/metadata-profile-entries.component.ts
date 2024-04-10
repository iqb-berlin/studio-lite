import { Component, Input } from '@angular/core';
import { MetadataValues } from '@studio-lite-lib/api-dto';
import { TextWithLanguage } from '@iqb/metadata/md-main';
import { IsArrayPipe } from '../../pipes/isArray.pipe';
import { CastPipe } from '../../pipes/cast.pipe';

@Component({
  selector: 'studio-lite-metadata-profile-entries',
  templateUrl: './metadata-profile-entries.component.html',
  styleUrls: ['./metadata-profile-entries.component.scss'],
  standalone: true,
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

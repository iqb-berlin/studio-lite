import { Pipe, PipeTransform } from '@angular/core';
import { profileLanguages, ProfileTexts } from '../utils/profile-languages.utils';

/** The languages a metadata profile is complete in, for the place a profile is chosen (#2212). */
@Pipe({
  name: 'profileLanguages',
  standalone: true
})
export class ProfileLanguagesPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(profile: ProfileTexts | null | undefined): string[] {
    return profileLanguages(profile);
  }
}

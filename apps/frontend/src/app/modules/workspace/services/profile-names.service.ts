import { Injectable, signal } from '@angular/core';
import { LanguageCodedText as TextWithLanguage } from '@iqbspecs/metadata-profile';
import { MetadataBackendService } from '../../metadata/services/metadata-backend.service';

/**
 * The names of metadata profiles, as the profiles bring them in their languages, by the profile's url
 * (#2235). Each profile is asked for once; one the server does not deliver is asked for again with the
 * next request, and is shown by its url meanwhile.
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileNamesService {
  private readonly labelsState = signal<Record<string, TextWithLanguage[]>>({});
  /** The labels delivered so far, by profile url. */
  readonly labels = this.labelsState.asReadonly();
  private readonly asked = new Set<string>();

  constructor(private metadataBackendService: MetadataBackendService) {}

  /** Asks for the profiles of these urls not asked for yet. */
  request(profileIds: string[]): void {
    profileIds
      .filter(profileId => !this.asked.has(profileId))
      .forEach(profileId => {
        this.asked.add(profileId);
        this.metadataBackendService.getMetadataProfile(profileId)
          .subscribe(profile => {
            const label = typeof profile === 'object' && profile ? profile.label : undefined;
            if (label?.length) {
              this.labelsState.update(labels => ({ ...labels, [profileId]: label }));
            } else {
              this.asked.delete(profileId);
            }
          });
      });
  }
}

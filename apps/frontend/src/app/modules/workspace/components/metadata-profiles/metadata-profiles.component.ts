import {
  Component, computed, effect, inject, input, signal
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MetadataResolver } from '@iqb/metadata-resolver';
import { MetadataProfileUse } from '../../utils/metadata-profiles.utils';
import { ProfileNamesService } from '../../services/profile-names.service';
import { LanguageService } from '../../../../services/language.service';

/** A line: an i18n key and what it is filled with. */
interface ProfileLine {
  key: string;
  params?: Record<string, string>;
}

interface ProfileLines {
  assigned: ProfileLine[];
  unused: ProfileLine[];
  /** What the toggle of the unused profiles is filled with: how many there are. */
  unusedCount: Record<string, string>;
}

/**
 * Which metadata profile the workspace assigns, and of which others the unit keeps values that are not
 * used (#2235): above the forms of the metadata tab, and in the unit check. The profiles are named as
 * they name themselves, in the language of the interface where they bring it; a profile not delivered
 * is named by its url.
 */
@Component({
  selector: 'studio-lite-metadata-profiles',
  templateUrl: './metadata-profiles.component.html',
  styleUrls: ['./metadata-profiles.component.scss'],
  imports: [MatIcon, TranslateModule]
})
export class MetadataProfilesComponent {
  /** The profiles of the unit; none given, none shown. */
  readonly unit = input<MetadataProfileUse>();
  /** The profiles of the items; none given, none shown. */
  readonly items = input<MetadataProfileUse>();
  /** Whether the assigned profiles say whether they are the unit's or the items': where both stand together. */
  readonly withTarget = input(false);
  /**
   * Whether the unused profiles are listed only on request, below a line that says how many there are: above
   * the forms, which they would push down, rather than in the unit check.
   */
  readonly collapsible = input(false);

  private readonly expandedState = signal(false);
  /** Whether the unused profiles are listed, where they are only on request. */
  readonly expanded = this.expandedState.asReadonly();

  private readonly profileNames = inject(ProfileNamesService);
  private readonly language = inject(LanguageService).active.code;

  // the same profiles are no change: the names are not asked for again with every edit of the metadata,
  // which a profile the server does not deliver would be
  private readonly profileIds = computed((): string[] => [this.unit(), this.items()]
    .flatMap(use => (use ? [use.assigned, ...use.unused.map(profile => profile.profileId)] : []))
    .filter((profileId): profileId is string => !!profileId), {
    equal: (a, b) => a.length === b.length && a.every((profileId, index) => profileId === b[index])
  });

  readonly lines = computed((): ProfileLines => {
    const labels = this.profileNames.labels();
    // a label without text names the profile no better than its url
    const name = (profileId: string): string => (labels[profileId] &&
      MetadataResolver.extractLabelText(labels[profileId], this.language)) || profileId;
    const assignedLine = (use: MetadataProfileUse, target: 'unit' | 'item'): ProfileLine => {
      // metadata.assigned-profile, metadata.assigned-unit-profile, metadata.assigned-item-profile,
      // metadata.no-profile, metadata.no-unit-profile, metadata.no-item-profile
      const forTarget = this.withTarget() ? `${target}-` : '';
      return use.assigned ?
        { key: `metadata.assigned-${forTarget}profile`, params: { name: name(use.assigned) } } :
        { key: `metadata.no-${forTarget}profile` };
    };
    const unit = this.unit();
    const items = this.items();
    const unused = [
      ...(unit?.unused ?? []).map(profile => ({
        key: 'metadata.unused-unit-profile', params: { name: name(profile.profileId) }
      })),
      ...(items?.unused ?? []).map(profile => ({
        key: profile.items === 1 ? 'metadata.unused-item-profile-one' : 'metadata.unused-item-profile',
        params: { name: name(profile.profileId), count: String(profile.items ?? 0) }
      }))
    ];
    return {
      assigned: [
        ...(unit ? [assignedLine(unit, 'unit')] : []),
        ...(items ? [assignedLine(items, 'item')] : [])
      ],
      unused,
      unusedCount: { count: String(unused.length) }
    };
  });

  constructor() {
    effect(() => this.profileNames.request(this.profileIds()));
  }

  /** Lists the unused profiles, or no longer, where they are listed only on request. */
  toggleUnused(): void {
    this.expandedState.update(expanded => !expanded);
  }
}

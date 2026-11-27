import { ProfileValues, UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { profileIdsMatch, toW3idProfileId } from '@studio-lite/shared-code';
import { FilledEntriesPipe } from '../../../pipes/filled-entries.pipe';

/** The metadata profiles a workspace assigns, one for its units and one for their items; undefined: none. */
export interface MetadataProfileIds {
  unit?: string;
  item?: string;
}

/** A profile the metadata hold values of, though the workspace does not assign it. */
export interface UnusedMetadataProfile {
  /** In its w3id spelling, where it has one. */
  profileId: string;
  /** For an item profile: how many items hold values of it. */
  items?: number;
}

/** Which profile the workspace assigns, and of which others values are stored all the same (#2235). */
export interface MetadataProfileUse {
  assigned: string | undefined;
  unused: UnusedMetadataProfile[];
}

export interface MetadataProfiles {
  unit: MetadataProfileUse;
  items: MetadataProfileUse;
}

const filledEntries = new FilledEntriesPipe();

/**
 * Whether a profile holds a value: one the read-only views show, or a plain text the legacy form stored,
 * which has no text to show (the server derives none from it) but is a value all the same.
 */
function holdsValues(profile: ProfileValues): boolean {
  return filledEntries.transform(profile.entries).length > 0 ||
    (profile.entries ?? []).some(entry => typeof entry.value === 'string' && entry.value.trim() !== '');
}

/**
 * The profiles of the metadata the workspace does not assign, by the profile in its w3id spelling: those
 * holding a value. A profile without any holds nothing to be missed.
 */
function unusedProfileIds(profiles: ProfileValues[] | undefined, assigned: string | undefined): string[] {
  return (profiles ?? [])
    .filter(profile => !!profile.profileId &&
      // an empty id would match the empty profile of a workspace without one
      !(assigned && profileIdsMatch(profile.profileId, assigned)) &&
      holdsValues(profile))
    .map(profile => toW3idProfileId(profile.profileId as string));
}

/**
 * Which metadata profiles the workspace assigns, and of which others the unit holds values all the same
 * (#2235): kept from a profile assigned earlier, they are shown nowhere and left out of the XML export.
 * Compared with the settings, not with the stored order -- a profile the form has just added has none
 * until it is saved -- and in either spelling of a profile's url (#1570). The order is that of the
 * metadata; an item profile counts the items holding values of it.
 */
export function metadataProfiles(
  metadata: UnitMetadataValues | undefined,
  { unit, item }: MetadataProfileIds
): MetadataProfiles {
  const unusedUnitProfiles = [...new Set(unusedProfileIds(metadata?.profiles, unit))];
  const itemCounts = new Map<string, number>();
  (metadata?.items ?? []).forEach(metadataItem => {
    new Set(unusedProfileIds(metadataItem.profiles, item))
      .forEach(profileId => itemCounts.set(profileId, (itemCounts.get(profileId) ?? 0) + 1));
  });
  return {
    unit: { assigned: unit, unused: unusedUnitProfiles.map(profileId => ({ profileId })) },
    items: {
      assigned: item,
      unused: [...itemCounts].map(([profileId, items]) => ({ profileId, items }))
    }
  };
}

/** Whether the unit holds values of a profile the workspace does not assign. */
export function hasUnusedProfiles(profiles: MetadataProfiles): boolean {
  return profiles.unit.unused.length > 0 || profiles.items.unused.length > 0;
}

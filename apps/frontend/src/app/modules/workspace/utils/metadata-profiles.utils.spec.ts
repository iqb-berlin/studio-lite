import { ItemsMetadataValues, ProfileValues } from '@studio-lite-lib/api-dto';
import { hasUnusedProfiles, metadataProfiles } from './metadata-profiles.utils';

const MATH_UNIT = 'https://w3id.org/iqb/p11/unit/';
const MATH_ITEM = 'https://w3id.org/iqb/p11/item/';
const GERMAN_UNIT = 'https://w3id.org/iqb/p12/unit/';
const GERMAN_ITEM = 'https://w3id.org/iqb/p12/item/';
// the same profile as MATH_UNIT, in the spelling stored before #1570
const MATH_UNIT_GITHUB = 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json';

// a profile with a value, as the read-only views count one: a text in valueAsText
const filled = (profileId: string): ProfileValues => ({
  profileId,
  entries: [{ id: 'iqb_author', label: [], valueAsText: [{ lang: 'de', value: 'Elsa Mignon' }] }]
} as unknown as ProfileValues);
// a profile the form stored without any value
const empty = (profileId: string): ProfileValues => ({
  profileId,
  entries: [{ id: 'iqb_author', label: [], valueAsText: [] }]
} as unknown as ProfileValues);
const item = (...profiles: ProfileValues[]): ItemsMetadataValues => ({ id: 'I1', profiles });

describe('metadataProfiles', () => {
  it('gives the profiles the workspace assigns', () => {
    const profiles = metadataProfiles({}, { unit: GERMAN_UNIT, item: GERMAN_ITEM });

    expect(profiles.unit.assigned).toBe(GERMAN_UNIT);
    expect(profiles.items.assigned).toBe(GERMAN_ITEM);
    expect(hasUnusedProfiles(profiles)).toBe(false);
  });

  // values kept from the profile assigned before (#2235)
  it('names the profiles of the unit with values the workspace does not assign', () => {
    const profiles = metadataProfiles(
      { profiles: [filled(GERMAN_UNIT), filled(MATH_UNIT)] },
      { unit: GERMAN_UNIT }
    );

    expect(profiles.unit.unused).toEqual([{ profileId: MATH_UNIT }]);
    expect(hasUnusedProfiles(profiles)).toBe(true);
  });

  it('leaves out a profile without any value: nothing of it is missed', () => {
    const profiles = metadataProfiles({ profiles: [empty(MATH_UNIT)] }, { unit: GERMAN_UNIT });

    expect(profiles.unit.unused).toEqual([]);
  });

  // the legacy form stored a text as a plain string; the server derives no text to show from it
  it('names a profile holding a plain text of the legacy form', () => {
    const legacy = {
      profileId: MATH_UNIT,
      entries: [{
        id: 'iqb_author', label: [], value: 'Elsa Mignon', valueAsText: []
      }]
    } as unknown as ProfileValues;

    expect(metadataProfiles({ profiles: [legacy] }, { unit: GERMAN_UNIT }).unit.unused)
      .toEqual([{ profileId: MATH_UNIT }]);
  });

  // #1570: the profile assigned, in the spelling stored before
  it('takes the assigned profile in its other spelling for the assigned one', () => {
    const profiles = metadataProfiles({ profiles: [filled(MATH_UNIT_GITHUB)] }, { unit: MATH_UNIT });

    expect(profiles.unit.unused).toEqual([]);
  });

  it('names a profile stored in both spellings once, in its w3id spelling', () => {
    const profiles = metadataProfiles(
      { profiles: [filled(MATH_UNIT_GITHUB), filled(MATH_UNIT)] },
      { unit: GERMAN_UNIT }
    );

    expect(profiles.unit.unused).toEqual([{ profileId: MATH_UNIT }]);
  });

  it('names every profile with values where the workspace assigns none', () => {
    const profiles = metadataProfiles({ profiles: [filled(MATH_UNIT)] }, {});

    expect(profiles.unit.assigned).toBeUndefined();
    expect(profiles.unit.unused).toEqual([{ profileId: MATH_UNIT }]);
  });

  it('counts the items holding values of an item profile the workspace does not assign', () => {
    const profiles = metadataProfiles(
      {
        items: [
          item(filled(MATH_ITEM), filled(GERMAN_ITEM)),
          item(filled(MATH_ITEM)),
          item(empty(MATH_ITEM)),
          item(filled(GERMAN_ITEM))
        ]
      },
      { item: GERMAN_ITEM }
    );

    expect(profiles.items.unused).toEqual([{ profileId: MATH_ITEM, items: 2 }]);
  });
});

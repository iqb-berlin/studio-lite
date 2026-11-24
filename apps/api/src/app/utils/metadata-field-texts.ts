import {
  MetadataProfileGroup, ProfileValues, TopConcept, UnitMetadataValues
} from '@studio-lite-lib/api-dto';
import { LanguageCodedText } from '@iqbspecs/metadata-profile';
import { FieldTexts, ProfileFieldTexts } from './metadata-value-as-text';

/** What a stored profile definition offers here: its groups of fields. */
export type StoredProfile = { groups: MetadataProfileGroup[] };

/** Field texts plus the vocabulary a field draws its terms from, before the vocabularies are read. */
export type FieldTextsWithVocabulary = FieldTexts & { vocabularyUrl?: string };

/** The unit's profiles and those of its items, in one list. */
export function profilesOf(metadata: UnitMetadataValues): ProfileValues[] {
  return [
    ...(metadata.profiles ?? []),
    ...(metadata.items ?? []).flatMap(item => item.profiles ?? [])
  ];
}

/**
 * profileId -> entryId -> what the stored profile brings for the field in every language it has:
 * its name and, for a yes/no field, the texts for yes and no. A vocabulary field also names its
 * vocabulary, whose term labels {@link withTermLabels} adds once it has been read.
 */
export function fieldTextsOf(
  profiles: Record<string, StoredProfile>
): Record<string, Record<string, FieldTextsWithVocabulary>> {
  const texts: Record<string, Record<string, FieldTextsWithVocabulary>> = {};
  Object.entries(profiles).forEach(([profileId, profile]) => {
    texts[profileId] = {};
    profile.groups.forEach(group => (group.entries ?? []).forEach(entry => {
      const parameters = entry.parameters as {
        trueLabel?: LanguageCodedText[]; falseLabel?: LanguageCodedText[]; url?: string
      } | null;
      const type = entry.type?.toUpperCase();
      // A profile comes from outside and is not validated: only lists of texts are taken over.
      const list = (given?: unknown) => (Array.isArray(given) ? given as LanguageCodedText[] : undefined);
      texts[profileId][entry.id] = {
        label: list(entry.label),
        ...(type === 'BOOLEAN' && { trueLabel: list(parameters?.trueLabel), falseLabel: list(parameters?.falseLabel) }),
        ...(type === 'VOCABULARY' && parameters?.url && { vocabularyUrl: parameters.url })
      };
    }));
  });
  return texts;
}

/** The vocabularies whose terms the metadata holds: only these need to be read. */
export function vocabularyUrlsInUse(
  metadata: UnitMetadataValues,
  texts: Record<string, Record<string, FieldTextsWithVocabulary>>
): string[] {
  const urls = new Set<string>();
  profilesOf(metadata).forEach(profile => (profile.entries ?? []).forEach(entry => {
    const url = texts[profile.profileId ?? '']?.[entry.id]?.vocabularyUrl;
    if (url && Array.isArray(entry.value) && entry.value.length) urls.add(url);
  }));
  return [...urls];
}

// The labels of every term of a vocabulary by id, from its concept tree as it is stored.
function termLabels(concepts: TopConcept[] | null | undefined): Record<string, LanguageCodedText[]> {
  const labels: Record<string, LanguageCodedText[]> = {};
  const add = (list: TopConcept[] | null | undefined) => (list ?? []).forEach(concept => {
    labels[concept.id] = Object.entries(concept.prefLabel ?? {})
      .map(([lang, value]) => ({ lang, value: value as string }));
    add(concept.narrower);
  });
  add(concepts);
  return labels;
}

/** Gives every vocabulary field the term labels of its vocabulary, where that vocabulary was read. */
export function withTermLabels(
  texts: Record<string, Record<string, FieldTextsWithVocabulary>>,
  conceptsByUrl: Record<string, TopConcept[] | null>
): ProfileFieldTexts {
  const terms: Record<string, Record<string, LanguageCodedText[]>> = {};
  Object.entries(conceptsByUrl).forEach(([url, concepts]) => {
    terms[url] = termLabels(concepts);
  });
  const result: ProfileFieldTexts = {};
  Object.entries(texts).forEach(([profileId, entries]) => {
    result[profileId] = {};
    Object.entries(entries).forEach(([entryId, { vocabularyUrl, ...fieldTexts }]) => {
      result[profileId][entryId] = vocabularyUrl && terms[vocabularyUrl] ?
        { ...fieldTexts, terms: terms[vocabularyUrl] } :
        fieldTexts;
    });
  });
  return result;
}

import { compareText } from '@studio-lite/shared-code';

type Text = { lang: string; value: string };

/** What of a metadata profile carries text: its name, its groups, their fields and the texts for yes and no. */
export type ProfileTexts = {
  label?: unknown;
  groups?: {
    label?: unknown;
    entries?: { label?: unknown; parameters?: unknown }[];
  }[];
};

// The languages of one list of texts; a list that is no list, and an empty text, give none.
function languagesOf(texts: unknown): Set<string> {
  if (!Array.isArray(texts)) return new Set();
  return new Set((texts as Text[])
    .filter(text => !!text && typeof text.lang === 'string' && !!text.value?.trim())
    .map(text => text.lang));
}

function textsOf(profile: ProfileTexts): unknown[] {
  return [
    profile.label,
    ...(profile.groups ?? []).flatMap(group => [
      group.label,
      ...(group.entries ?? []).flatMap(entry => {
        const parameters = entry.parameters as { trueLabel?: unknown; falseLabel?: unknown } | null | undefined;
        return [entry.label, parameters?.trueLabel, parameters?.falseLabel];
      })
    ])
  ];
}

/**
 * The languages a metadata profile is complete in: those that every text of it has -- its name, the
 * names of its groups and fields, the texts for yes and no. A list without any text, such as a group
 * without a name, does not count, nor does an empty text. A language the profile is only partly
 * translated into is not one of them, since the form would still show German field names. The
 * vocabularies do not count either. Ordered as in the profile's name, the rest after it (#2212).
 */
export function profileLanguages(profile: ProfileTexts | null | undefined): string[] {
  if (!profile) return [];
  const lists = textsOf(profile).map(languagesOf).filter(languages => languages.size > 0);
  if (!lists.length) return [];
  const named = Array.isArray(profile.label) ? (profile.label as Text[]).map(text => text?.lang) : [];
  const all = [...new Set([...named, ...[...lists[0]].sort(compareText)])];
  return all.filter(language => !!language && lists.every(languages => languages.has(language)));
}

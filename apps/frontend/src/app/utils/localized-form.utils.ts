import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { LocalizedText, UiLanguage } from '@studio-lite/shared-code';

/** What a form of texts written once per language holds: per language code, per text, the text. */
export type LocalizedFormValue = Record<string, Record<string, string>>;

/**
 * A form for texts an administrator writes once per language of the interface (#2186): a group
 * per language, named by its code, with a control per text.
 */
export function localizedTextsForm(
  fb: UntypedFormBuilder,
  languages: readonly UiLanguage[],
  keys: readonly string[]
): UntypedFormGroup {
  return fb.group(Object.fromEntries(languages.map(language => [
    language.code,
    fb.group(Object.fromEntries(keys.map(key => [key, fb.control('')])))
  ])));
}

/** The stored texts as the form holds them; a language without a text gets an empty field. */
export function localizedFormValue<K extends string>(
  texts: Partial<Record<K, LocalizedText>>,
  languages: readonly UiLanguage[],
  keys: readonly K[]
): LocalizedFormValue {
  return Object.fromEntries(languages.map(language => [
    language.code,
    Object.fromEntries(keys.map(key => [key, texts[key]?.[language.code] ?? '']))
  ]));
}

/**
 * The texts as entered, put over the stored ones: a language the studio does not offer keeps what is
 * stored for it, since the form never showed it (#1964).
 */
export function localizedTextsFromForm<K extends string>(
  stored: Partial<Record<K, LocalizedText>>,
  value: LocalizedFormValue,
  keys: readonly K[]
): Record<K, LocalizedText> {
  return Object.fromEntries(keys.map(key => [key, {
    ...stored[key],
    ...Object.fromEntries(Object.entries(value).map(([code, texts]) => [code, texts[key] ?? '']))
  }])) as Record<K, LocalizedText>;
}

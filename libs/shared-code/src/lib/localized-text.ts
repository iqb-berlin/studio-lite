import { DEFAULT_UI_LANGUAGE } from './ui-languages';

/**
 * A text an administrator writes once per language of the interface -- the title, the start page,
 * the imprint, the warning, the mail to new users -- keyed by the language's code (#2186).
 */
export type LocalizedText = Record<string, string>;

/** The texts of the config (`ConfigDto`) written once per language; API and administration read this list. */
export const LOCALIZED_CONFIG_TEXTS = ['appTitle', 'introHtml', 'imprintHtml', 'globalWarningText'] as const;
/** The texts of the mail to a new user (`EmailTemplateDto`), written once per language. */
export const LOCALIZED_EMAIL_TEMPLATE_TEXTS = ['emailSubject', 'emailBody'] as const;

/**
 * A stored text as one per language. A plain string was stored before the texts had languages and
 * counts as German; anything that is not text is dropped.
 */
export function toLocalizedText(value: unknown): LocalizedText {
  if (typeof value === 'string') return { [DEFAULT_UI_LANGUAGE]: value };
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value).filter(([, text]) => typeof text === 'string'));
}

/** The text in the language `code`; where that is missing or empty, the German one. */
export function textIn(text: LocalizedText | undefined, code: string): string {
  return text?.[code] || text?.[DEFAULT_UI_LANGUAGE] || '';
}

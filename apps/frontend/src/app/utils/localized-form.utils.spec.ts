import { UntypedFormBuilder } from '@angular/forms';
import { UI_LANGUAGES } from '@studio-lite/shared-code';
import { localizedFormValue, localizedTextsForm, localizedTextsFromForm } from './localized-form.utils';

const keys = ['appTitle', 'introHtml'];

describe('localized form texts (#2186)', () => {
  it('gives every language a group with every text', () => {
    const form = localizedTextsForm(new UntypedFormBuilder(), UI_LANGUAGES, keys);
    expect(form.getRawValue()).toEqual({
      de: { appTitle: '', introHtml: '' },
      en: { appTitle: '', introHtml: '' }
    });
  });

  it('fills the form from the stored texts, leaving a language without one empty', () => {
    const stored = { appTitle: { de: 'Studio', fr: 'Studio FR' }, introHtml: undefined };
    expect(localizedFormValue(stored, UI_LANGUAGES, keys))
      .toEqual({
        de: { appTitle: 'Studio', introHtml: '' },
        en: { appTitle: '', introHtml: '' }
      });
  });

  it('writes the texts entered over the stored ones and keeps a language the form does not show', () => {
    expect(localizedTextsFromForm(
      { appTitle: { de: 'Alt', fr: 'Ancien' } },
      { de: { appTitle: 'Neu', introHtml: '<p>Hallo</p>' }, en: { appTitle: '', introHtml: '<p>Hello</p>' } },
      keys
    )).toEqual({
      appTitle: { de: 'Neu', en: '', fr: 'Ancien' },
      introHtml: { de: '<p>Hallo</p>', en: '<p>Hello</p>' }
    });
  });
});

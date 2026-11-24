import { profileLanguages } from './profile-languages.utils';

const de = (value: string) => ({ lang: 'de', value });
const en = (value: string) => ({ lang: 'en', value });

// The languages shown behind a profile where it is chosen (#2212).
describe('profileLanguages', () => {
  const bilingual = {
    label: [de('Aufgabe'), en('Unit')],
    groups: [{
      label: [de('Angaben'), en('Details')],
      entries: [
        { label: [de('Klassenstufe'), en('Grade level')], parameters: null },
        {
          label: [de('Tastatur'), en('Keyboard')],
          parameters: { trueLabel: [de('ja'), en('yes')], falseLabel: [de('nein'), en('no')] }
        }
      ]
    }]
  };

  it('names every language all texts of the profile have, in the order of its name', () => {
    expect(profileLanguages(bilingual)).toEqual(['de', 'en']);
  });

  it('leaves out a language the profile is only partly translated into', () => {
    const partly = {
      ...bilingual,
      groups: [{ ...bilingual.groups[0], entries: [{ label: [de('Notiz')], parameters: null }] }]
    };

    expect(profileLanguages(partly)).toEqual(['de']);
  });

  it('counts the texts for yes and no', () => {
    const groups = [{
      label: [de('Angaben'), en('Details')],
      entries: [{ label: [de('Tastatur'), en('Keyboard')], parameters: { trueLabel: [de('ja')], falseLabel: [] } }]
    }];

    expect(profileLanguages({ label: [de('Aufgabe'), en('Unit')], groups })).toEqual(['de']);
  });

  it('does not count a group without a name or an empty text', () => {
    const profile = {
      label: [de('Aufgabe'), en('Unit'), { lang: 'fr', value: ' ' }],
      groups: [{ label: [], entries: [{ label: [de('Titel'), en('Title')], parameters: null }] }]
    };

    expect(profileLanguages(profile)).toEqual(['de', 'en']);
  });

  it.each([
    ['a profile without a complete language', { label: [de('Aufgabe')], groups: [{ label: [en('Details')] }] }],
    ['a profile without texts', { label: [], groups: [] }],
    ['no profile', undefined]
  ])('names nothing for %s', (_, profile) => {
    expect(profileLanguages(profile)).toEqual([]);
  });
});

import { TopConcept, UnitMetadataValues } from '@studio-lite-lib/api-dto';
import {
  StoredProfile, fieldTextsOf, vocabularyUrlsInUse, withTermLabels
} from './metadata-field-texts';

const de = (value: string) => ({ lang: 'de', value });
const en = (value: string) => ({ lang: 'en', value });

const profile: StoredProfile = {
  groups: [{
    label: [de('Angaben')],
    entries: [
      {
        id: 'title', label: [de('Titel'), en('Title')], type: 'TEXT', parameters: { format: 'SINGLE' }
      },
      {
        id: 'multiple',
        label: [de('Mehrfachantwort'), en('Multiple response')],
        type: 'BOOLEAN',
        parameters: { trueLabel: [de('ja'), en('yes')], falseLabel: [de('nein'), en('no')] }
      },
      {
        id: 'data',
        label: [de('Art der Daten')],
        type: 'VOCABULARY',
        parameters: { url: 'https://w3id.org/iqb/v85/dt/' }
      }
    ]
  }]
};

describe('fieldTextsOf', () => {
  it('takes the name of every field, the texts for yes and no and the vocabulary from the profile', () => {
    expect(fieldTextsOf({ p1: profile })).toEqual({
      p1: {
        title: { label: [de('Titel'), en('Title')] },
        multiple: {
          label: [de('Mehrfachantwort'), en('Multiple response')],
          trueLabel: [de('ja'), en('yes')],
          falseLabel: [de('nein'), en('no')]
        },
        data: { label: [de('Art der Daten')], vocabularyUrl: 'https://w3id.org/iqb/v85/dt/' }
      }
    });
  });
});

describe('vocabularyUrlsInUse', () => {
  it('names a vocabulary once, and only where unit or item metadata holds terms of it', () => {
    const texts = {
      p1: { data: { vocabularyUrl: 'v/dt/' }, other: { vocabularyUrl: 'v/other/' } },
      item: { data: { vocabularyUrl: 'v/dt/' } }
    };
    const metadata = {
      profiles: [{ profileId: 'p1', entries: [{ id: 'data', value: [{ id: 'v/dt/1' }] }, { id: 'other', value: [] }] }],
      items: [{ profiles: [{ profileId: 'item', entries: [{ id: 'data', value: [{ id: 'v/dt/3' }] }] }] }]
    } as unknown as UnitMetadataValues;

    expect(vocabularyUrlsInUse(metadata, texts)).toEqual(['v/dt/']);
  });
});

describe('withTermLabels', () => {
  it('gives a vocabulary field the labels of all its terms, narrower ones too, in every language', () => {
    const concepts = [{
      id: 'v/dt/1',
      prefLabel: { de: 'Daten', en: 'Data' },
      notation: [],
      narrower: [{
        id: 'v/dt/1.1', prefLabel: { de: 'Umfragedaten', en: 'Survey data' }, notation: [], narrower: []
      }]
    }] as unknown as TopConcept[];

    const result = withTermLabels(
      { p1: { data: { label: [de('Art der Daten')], vocabularyUrl: 'v/dt/' }, unread: { vocabularyUrl: 'v/x/' } } },
      { 'v/dt/': concepts }
    );

    expect(result.p1.data).toEqual({
      label: [de('Art der Daten')],
      terms: { 'v/dt/1': [de('Daten'), en('Data')], 'v/dt/1.1': [de('Umfragedaten'), en('Survey data')] }
    });
    // a field whose vocabulary was not read keeps its stored term labels
    expect(result.p1.unread).toEqual({});
  });
});

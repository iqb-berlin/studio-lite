import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';
import { FilledEntriesPipe } from './filled-entries.pipe';

describe('FilledEntriesPipe', () => {
  let pipe: FilledEntriesPipe;

  const createEntry = (
    id: string,
    valueAsText?: MetadataValuesEntry['valueAsText']
  ): MetadataValuesEntry => Object.assign(new MetadataValuesEntry(), {
    id,
    label: [{ lang: 'de', value: id }],
    value: '',
    ...(valueAsText !== undefined && { valueAsText })
  });

  beforeEach(() => {
    pipe = new FilledEntriesPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty array for undefined input', () => {
    expect(pipe.transform(undefined)).toEqual([]);
  });

  it('should return an empty array for null input', () => {
    expect(pipe.transform(null)).toEqual([]);
  });

  it('should keep an entry with a non-empty single valueAsText', () => {
    const entry = createEntry('entry1', { lang: 'de', value: 'Wert' });
    expect(pipe.transform([entry])).toEqual([entry]);
  });

  it('should drop an entry with an empty single valueAsText', () => {
    const entry = createEntry('entry1', { lang: 'de', value: '' });
    expect(pipe.transform([entry])).toEqual([]);
  });

  it('should drop an entry with a whitespace-only single valueAsText', () => {
    const entry = createEntry('entry1', { lang: 'de', value: '   ' });
    expect(pipe.transform([entry])).toEqual([]);
  });

  it('should drop an entry without valueAsText', () => {
    const entry = createEntry('entry1');
    expect(pipe.transform([entry])).toEqual([]);
  });

  it('should drop an entry with an empty valueAsText array', () => {
    const entry = createEntry('entry1', []);
    expect(pipe.transform([entry])).toEqual([]);
  });

  it('should drop an entry whose valueAsText array holds only empty values', () => {
    const entry = createEntry('entry1', [
      { lang: 'de', value: '' },
      { lang: 'en', value: ' ' }
    ]);
    expect(pipe.transform([entry])).toEqual([]);
  });

  it('should keep an entry whose valueAsText array holds at least one non-empty value', () => {
    const entry = createEntry('entry1', [
      { lang: 'de', value: '' },
      { lang: 'en', value: 'value' }
    ]);
    expect(pipe.transform([entry])).toEqual([entry]);
  });

  it('should keep only filled entries of a mixed list', () => {
    const filled = createEntry('filled', { lang: 'de', value: 'Wert' });
    const filledList = createEntry('filledList', [{ lang: 'de', value: 'Wert' }]);
    const empty = createEntry('empty', { lang: 'de', value: '' });
    const emptyList = createEntry('emptyList', []);
    expect(pipe.transform([filled, empty, filledList, emptyList])).toEqual([filled, filledList]);
  });
});

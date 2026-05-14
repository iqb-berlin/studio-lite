import { GetRichNoteLinkTypeLabelPipe } from './get-rich-note-link-type-label.pipe';

describe('GetRichNoteLinkTypeLabelPipe', () => {
  let pipe: GetRichNoteLinkTypeLabelPipe;

  beforeEach(() => {
    pipe = new GetRichNoteLinkTypeLabelPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform UPPER_SNAKE_CASE to kebab-case translation key', () => {
    expect(pipe.transform('MATERIAL_DOWNLOAD')).toBe('rich-note.link-type-values.material-download');
    expect(pipe.transform('COMPETENCE_DESCRIPTION')).toBe('rich-note.link-type-values.competence-description');
  });

  it('should return empty string for undefined input', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});

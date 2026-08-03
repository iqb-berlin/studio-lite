import { IsProfileSelectedPipe } from './is-profile-selected.pipe';

describe('IsProfileSelectedPipe', () => {
  let pipe: IsProfileSelectedPipe;
  const github = 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json';
  const w3id = 'https://w3id.org/iqb/p11/unit/';

  beforeEach(() => {
    pipe = new IsProfileSelectedPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('recognizes a profile that is selected under the same spelling', () => {
    expect(pipe.transform(w3id, [{ id: w3id }])).toBe(true);
  });

  it('recognizes a selection stored in the retired github spelling', () => {
    expect(pipe.transform(w3id, [{ id: github }])).toBe(true);
    expect(pipe.transform(github, [{ id: w3id }])).toBe(true);
  });

  it('keeps unit and item profiles of the same profile number apart', () => {
    expect(pipe.transform('https://w3id.org/iqb/p11/item/', [{ id: w3id }])).toBe(false);
  });

  it('keeps different profile numbers apart', () => {
    expect(pipe.transform('https://w3id.org/iqb/p12/unit/', [{ id: w3id }])).toBe(false);
  });

  it('does not match a self-hosted copy against the official profile', () => {
    expect(pipe.transform('https://example.org/mirror/iqb-vocabs/p11/master/unit.json', [{ id: w3id }]))
      .toBe(false);
  });

  it('returns false for empty input', () => {
    expect(pipe.transform(undefined, [{ id: w3id }])).toBe(false);
    expect(pipe.transform(w3id, [])).toBe(false);
    expect(pipe.transform(w3id, undefined)).toBe(false);
  });
});

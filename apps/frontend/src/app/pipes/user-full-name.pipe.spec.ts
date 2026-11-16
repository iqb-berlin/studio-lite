import { UserFullNamePipe } from './user-full-name.pipe';

describe('UserFullNamePipe', () => {
  const pipe = new UserFullNamePipe();

  it.each<[string, [string, string?, string?], string]>([
    ['last name and first name', ['zabel', 'Abel', 'Zoe'], 'Abel, Zoe'],
    ['the last name alone', ['zabel', 'Abel'], 'Abel'],
    ['the login name where no last name is entered', ['zabel'], 'zabel'],
    ['the login name and the first name', ['zabel', undefined, 'Zoe'], 'zabel, Zoe'],
    ['the login name where the last name is but blanks', ['zabel', '  ', ' '], 'zabel']
  ])('should show %s', (_, texts, shown) => {
    expect(pipe.transform(...texts)).toBe(shown);
  });
});

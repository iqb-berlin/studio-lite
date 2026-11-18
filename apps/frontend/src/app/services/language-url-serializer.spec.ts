import { TestBed } from '@angular/core/testing';
import { PRIMARY_OUTLET } from '@angular/router';
import { LanguageUrlSerializer } from './language-url-serializer';
import { LanguageService } from './language.service';

describe('LanguageUrlSerializer', () => {
  const serializerIn = (prefix: string): LanguageUrlSerializer => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LanguageUrlSerializer,
        { provide: LanguageService, useValue: { codes: ['de', 'en'], prefix } }
      ]
    });
    return TestBed.inject(LanguageUrlSerializer);
  };

  // The router sees no prefix, so routes, links and guards stay as they were; what it writes back
  // carries the language, the secondary view and the query included (#2174).
  it.each([
    ['/en/a/5/12/editor'],
    ['/en/a/5/12/(properties//secondary:preview)'],
    ['/en/home?redirectTo=%2Fen%2Fa%2F5'],
    ['/en/home/3f2c9a1e-0b7d-4c1a-9e7f-2a6b5c4d3e21']
  ])('should read %s without the prefix and write it back with it, in English', (url: string) => {
    const serializer = serializerIn('/en');

    const tree = serializer.parse(url);

    expect(tree.root.children[PRIMARY_OUTLET].segments[0].path).not.toBe('en');
    expect(serializer.serialize(tree)).toBe(url);
  });

  it('should write German addresses without a prefix, also when one was given', () => {
    const serializer = serializerIn('');

    expect(serializer.serialize(serializer.parse('/de/a/5/12/editor'))).toBe('/a/5/12/editor');
    expect(serializer.serialize(serializer.parse('/a/5/12/editor'))).toBe('/a/5/12/editor');
  });

  it('should keep a review link as the login name it is', () => {
    const serializer = serializerIn('');

    expect(serializer.parse('/3f2c9a1e-0b7d-4c1a-9e7f-2a6b5c4d3e21').root.children[PRIMARY_OUTLET].segments[0].path)
      .toBe('3f2c9a1e-0b7d-4c1a-9e7f-2a6b5c4d3e21');
  });
});
